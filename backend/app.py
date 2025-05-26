from datetime import datetime, timezone
from functools import wraps
import time
from flask import Flask, json, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import firebase_admin
from firebase_admin import credentials, auth
import pandas as pd
from werkzeug.utils import secure_filename
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from sqlalchemy.orm import joinedload


# Initialize Flask app and extensions
app = Flask(__name__)

# used when backend and frontend are running on different ports
CORS(app)

# Firebase initialization
cred = credentials.Certificate('firebase.json')
firebase_admin.initialize_app(cred)

# Load configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:dbmslab@localhost/TABLES'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'  # Directory for storing profile images
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# SQLAlchemy Models
# Admin Dashboard Model
class AdminDashboard(db.Model):
    _tablename_ = 'admin_dashboard' 
    action_id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.String(100), nullable=False)
    action_type = db.Column(db.String(100), nullable=False)
    action_timestamp = db.Column(db.DateTime, nullable=False)

# Blog Comments Model
class BlogComment(db.Model):
    _tablename_ = 'blog_comments'
    
    comment_id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('blog_post.post_id'), nullable=False)  # Assuming there is a Blog model
    user_id = db.Column(db.String(100), db.ForeignKey('user.user_id'), nullable=False)
    comment_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)

class BlogPost(db.Model):
    _tablename_ = 'blog_post'

    post_id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.String(100), db.ForeignKey('user.user_id'), nullable=False)  # Foreign key referencing User
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=True)
    category=db.Column(db.String(255), nullable=True)

# Post Analysis Model
class PostAnalysis(db.Model):
    _tablename_ = 'post_analysis'
    analysis_id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('blog_post.post_id'), primary_key=True)
    sentiment = db.Column(db.String(50), nullable=True)
    avg_read_time = db.Column(db.Integer, nullable=False)  # Store in seconds
    created_at = db.Column(db.DateTime, nullable=False)

# Post Metrics Model
class PostMetrics(db.Model):
    _tablename_ = 'post_metrics'
    
    post_id = db.Column(db.Integer, db.ForeignKey('blog_post.post_id'), primary_key=True)
    views_count = db.Column(db.Integer, default=0)
    likes_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    liked_users = db.Column(db.Text, default='[]')
    comments = db.Column(db.Text, default='[]')


# Summary Model
class Summary(db.Model):
    _tablename_ = 'summary'
    summary_id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('blog_post.post_id'), nullable=False)  # Assuming there is a Blog model
    summary_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)

# User Model
class User(db.Model):
    _tablename_ = 'user'
    user_id = db.Column(db.String(100), primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    email_id = db.Column(db.String(120), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    blogs = db.relationship('BlogPost', backref='author', lazy=True)
    profile_image = db.Column(db.String(255), default="static/uploads/default.png")

class Bookmark(db.Model):
   _tablename_ = 'bookmarks'
   
   user_id = db.Column(db.String(100), primary_key=True)
   post_id = db.Column(db.Integer, db.ForeignKey('blog_post.post_id'), primary_key=True)
   created_at = db.Column(db.DateTime, default=time.strftime('%Y-%m-%d %H:%M:%S'))
   
    
class Likes(db.Model):
   _tablename_ = 'likes'
   
   user_id = db.Column(db.String(255), primary_key=True)
   blog_id = db.Column(db.Integer, db.ForeignKey('blog_post.post_id'), primary_key=True)
   created_at = db.Column(db.DateTime, default=time.strftime('%Y-%m-%d %H:%M:%S'))


@app.route('/')
def home():
    return "Welcome to the Dynamic Blog Generator"
logging.basicConfig(level=logging.DEBUG)

# User registration
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")
        uid=data.get('user_id')
        email = data.get('email')
        password = data.get('password')
        name = data.get('username')

        # Validate input
        if not email or not password or not name:
            return jsonify({"message": "All fields are required"}), 400

        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters long"}), 400

        # Debugging: Log input data
        print(f"Registering user: Email: {email}, Name: {name}")
     

        # Create a user in the local database
        user = User(
            user_id=uid,  # Use Firebase UID
            user_name=name,
            email_id=email,
            role='user',  # Default role
            created_at=time.strftime('%Y-%m-%d %H:%M:%S')  # Current timestamp
        )
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except firebase_admin.auth.EmailAlreadyExistsError:
        return jsonify({"message": "Email already exists"}), 400
    except firebase_admin.auth.FirebaseError as e:
        # Handle Firebase-specific errors
        print(f"Firebase error: {e}")
        return jsonify({"message": "Firebase error occurred", "error": str(e)}), 500
    except Exception as e:
        # Handle other errors
        print(f"General error: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500



# User login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    try:
        user = auth.get_user_by_email(email)
        custom_token = auth.create_custom_token(user.uid)
        return jsonify({"message": "Login successful", "token": custom_token.decode()}), 200
    except firebase_admin.auth.UserNotFoundError:
        return jsonify({"message": "Invalid email or user not found"}), 404
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/verify-token', methods=['POST'])
def verify_token():
    data = request.json
    token = data.get('token')
    print(token)
    if not token:
        return jsonify({"message": "Token is missing"}), 400

    try:
        decoded_token = auth.verify_id_token(token)

        # Debugging: Print token and timestamps
        current_time = time.time()
        print(f"Token: {token}")
        print(f"Issued At (iat): {decoded_token['iat']}, Current Time: {current_time}")

        # Allow a tolerance window for clock skew
        tolerance_window = 300
        if abs(decoded_token['iat'] - current_time) > tolerance_window:
            return jsonify({"message": "Token used too early or too late"}), 401

        return jsonify({"message": "Token verified", "decoded_token": decoded_token}), 200
    except Exception as e:
        print(f"Error verifying token: {e}")
        return jsonify({"message": "Token verification failed", "error": str(e)}), 401

@app.route('/api/blogs', methods=['POST'])
def create_blog():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")
        title = data.get('title')
        content = data.get('content')
        image_url = data.get('image_url', '')
        category=data.get('category')
        if not title or not content or not category:
                    return jsonify({"message": "Title and content are required"}), 400

        author_id = data.get('user_id')
        print(author_id)

        current_time= datetime.now(timezone.utc)  # Correct for timezone-aware datetime


        blog = BlogPost(title=title, content=content, image_url=image_url, author_id=author_id, created_at=current_time,
            updated_at=current_time,category=category)
        db.session.add(blog)
        db.session.commit()

        return jsonify({"message": "Blog created successfully", "blog_id": blog.post_id}), 201
    except Exception as e:
        print(f"Error creating blog: {e}")
        return jsonify({"error": "Failed to create blog", "details": str(e)}), 500

# Fetch blogs
@app.route('/api/blogs', methods=['GET'])
def fetch_blogs():
    blogs = BlogPost.query.all()
    blog_list = []
    for blog in blogs:
        try:
            blog_list.append({
                "post_id": blog.post_id,
                "title": blog.title,
                "content": blog.content[:100] + "...",
                "image_url": blog.image_url,
                "author_name": blog.author.user_name,  # Corrected field
                "created_at": blog.created_at,
                "category": blog.category
            })
        except AttributeError as e:
            app.logger.error(f"Error processing blog {blog.post_id}: {e}")
    return jsonify(blog_list)


# View a single blog
@app.route('/api/blogs/<int:blog_id>', methods=['GET'])
def view_blog(blog_id):
    try:
        user_id = request.headers.get('User-ID')
        
        print(user_id)
        blog = BlogPost.query.get(blog_id)
        user=User.query.get(user_id)
        if not blog:
            return jsonify({"message": "Blog not found"}), 404
    
        like_count = db.session.query(Likes).filter_by(blog_id=blog_id).count()
        is_liked = db.session.query(Likes).filter_by(
                blog_id=blog_id,
                user_id=user_id
            ).first() is not None
        
        is_bookmarked = Bookmark.query.filter_by(
           post_id=blog_id,
           user_id=user_id
        ).first() is not None
       

        return jsonify({
            "post_id": blog.post_id,
            "title": blog.title,
            "content": blog.content,
            "image_url": blog.image_url,
            "author_name": blog.author.user_name,
            "created_at": blog.created_at,
            "category":blog.category,
            "like_count":like_count,
            "is_liked":is_liked,
            "is_bookmarked":is_bookmarked,
            "is_admin": user.is_admin,
            "author_id":blog.author_id
        })
    except Exception as e:
        return jsonify({"error": "Failed to fetch blog details", "details": str(e)}), 500



@app.route('/api/blogs/<int:post_id>', methods=['PUT'])
def update_blog(post_id):
    user_id = request.headers.get('User-ID')
    print(user_id)
    blog = BlogPost.query.get(post_id)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404

    data = request.json
    title = data.get("title")
    content = data.get("content")
    image_url = data.get("image_url")
    category = data.get("category")

    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400

    # Update blog details
    blog.title = title
    blog.content = content
    blog.image_url = image_url
    blog.category = category
    blog.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({"message": "Blog updated successfully!"}), 200


@app.route('/api/blogs/<int:id>', methods=['DELETE'])
def delete_blog(id):
    blog = BlogPost.query.get_or_404(id)
    db.session.delete(blog)
    db.session.commit()
    return jsonify({"message": "Blog deleted successfully!"})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# User profile
@app.route('/api/users/<int:user_id>', methods=['GET'])
def user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "blogs": [{"id": blog.id, "title": blog.title} for blog in user.blogs]
    })


@app.route('/api/blogs/<int:post_id>/metrics', methods=['GET'])
def get_metrics(post_id):
    post_metrics = PostMetrics.query.filter_by(post_id=post_id).first()
    if not post_metrics:
        return jsonify({
            "likes_count": 0,
            "comments_count": 0,
            "shares_count": 0
        })

    return jsonify({
        "likes_count": post_metrics.likes_count or 0,
        "comments_count": post_metrics.comments_count or 0,
        "shares_count": post_metrics.shares_count or 0
    })



@app.route('/api/blogs/<int:post_id>/view', methods=['POST'])
def increment_views(post_id):
    metric = PostMetrics.query.filter_by(post_id=post_id).first()
    if not metric:
        metric = PostMetrics(post_id=post_id)
        db.session.add(metric)
    metric.views_count += 1
   
    db.session.commit()
    return jsonify({"message": "View count updated", "views_count": metric.views_count})


@app.route('/api/blogs/<int:blog_id>/like', methods=['POST'])
def handle_like(blog_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        user_id = data.get('user_id')
        action = data.get('action')
        print(f"Received request - blog_id: {blog_id}, user_id: {user_id}, action: {action}")

        # Validate inputs
        if not user_id or not action:
            return jsonify({'error': 'Missing user_id or action'}), 400
        
        if action not in ['like', 'unlike']:
            return jsonify({'error': 'Invalid action'}), 400

        # Check if like exists
        existing_like = db.session.query(Likes).filter_by(
            blog_id=blog_id,
            user_id=user_id
        ).first()

        metrics = PostMetrics.query.filter_by(post_id=blog_id).first()
        if not metrics:
            metrics = PostMetrics(
               post_id=blog_id,
               views_count=0,
               likes_count=0,
               shares_count=0,
               comments_count=0,
               liked_users='[]',
               comments='[]'
            )
            db.session.add(metrics)
            db.session.commit()

        # Deserialize liked_users
        liked_users = metrics.liked_users if metrics.liked_users else []

        if action == 'like':
            if not existing_like:
                new_like = Likes(blog_id=blog_id, user_id=user_id)
                db.session.add(new_like)
                if user_id not in liked_users:
                    liked_users.append(user_id)
                    metrics.likes_count = len(liked_users)
        else:  # action is 'unlike'
            if existing_like:
                db.session.delete(existing_like)
                if user_id in liked_users:
                    liked_users.remove(user_id)
                    metrics.likes_count = len(liked_users)

        # Serialize liked_users back to JSON
        metrics.liked_users = json.dumps(liked_users)
        db.session.commit()

        # Determine if the user has liked the post
        is_liked = user_id in liked_users

        return jsonify({
            'like_count': metrics.likes_count,
            'isLiked': is_liked
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error in handle_like: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

@app.route('/api/blogs/<int:post_id>/share', methods=['POST'])
def increment_shares(post_id):
    metric = PostMetrics.query.filter_by(post_id=post_id).first()
    if not metric:
        metric = PostMetrics(post_id=post_id)
        db.session.add(metric)
    metric.shares_count += 1
   
    db.session.commit()
    return jsonify({"message": "Share count updated", "shares_count": metric.shares_count})

@app.route('/api/blogs/<int:post_id>/comment', methods=['POST'])
def increment_comments(post_id):
    data = request.get_json()  # Get comment content from the request body
    comment_text = data.get('content')
    
    if not comment_text:
        return jsonify({"error": "Comment text is required"}), 400

    metric = PostMetrics.query.filter_by(post_id=post_id).first()
    if not metric:
        metric = PostMetrics(post_id=post_id,comments_count=0, comments=json.dumps([]))
        db.session.add(metric)
        db.session.commit()
    # Append the new comment and increment the count
    comments = metric.comments
    comments.append({"content": comment_text})
    metric.comments= json.dumps(comments)
    metric.comments_count += 1

    db.session.commit()
    return jsonify({
        "message": "Comment added and count updated",
        "comments_count": metric.comments_count,
        "comments": metric.comments
    })



@app.route('/api/blogs/<int:blog_id>', methods=['GET'])
def get_blog(blog_id):
    metrics = PostMetrics.query.filter_by(blog_id=blog_id).first()
    if not metrics:
        return jsonify({'error': 'Blog not found'}), 404

    user_id = request.headers.get('User-ID')  # Pass user ID in request headers
    liked_users = json.loads(metrics.liked_users)
    is_liked = user_id in liked_users

    return jsonify({
        'blog_id': metrics.blog_id,
        'likes_count': metrics.likes_count,
        'isLiked': is_liked,
        'comment_count': metrics.comment_count,
        'comments':metrics.comments
      
    })

@app.route('/api/bookmark/check', methods=['GET'])
def check_bookmark():
    user_id = request.args.get('user_id')
    post_id = request.args.get('post_id')

    bookmark = Bookmark.query.filter_by(user_id=user_id).first()
    is_bookmarked = post_id in (bookmark.post_ids if bookmark else [])
    return jsonify({"isBookmarked": is_bookmarked})


@app.route('/api/blogs/<int:blog_id>/bookmark', methods=['POST'])
def handle_bookmark(blog_id):
    try:
       data = request.json
       if not data:
           return jsonify({'error': 'No data provided'}), 400
       user_id = data.get('user_id')
       action = data.get('action')
       print(f"Received bookmark request - blog_id: {blog_id}, user_id: {user_id}, action: {action}")
        # Validate inputs
       if not user_id or not action:
           return jsonify({'error': 'Missing user_id or action'}), 400
       
       if action not in ['bookmark', 'unbookmark']:
           return jsonify({'error': 'Invalid action'}), 400
        # Check if blog post exists
       blog = BlogPost.query.get(blog_id)
       if not blog:
           return jsonify({'error': 'Blog not found'}), 404
        # Check if bookmark exists
       existing_bookmark = Bookmark.query.filter_by(
           post_id=blog_id,
           user_id=user_id
       ).first()
       if action == 'bookmark':
           if not existing_bookmark:
               new_bookmark = Bookmark(
                   post_id=blog_id, 
                   user_id=user_id,
                   created_at=datetime.utcnow()
               )
               db.session.add(new_bookmark)
       else:  # action is 'unbookmark'
           if existing_bookmark:
               db.session.delete(existing_bookmark)
       db.session.commit()
        # Get updated bookmark status
       is_bookmarked = Bookmark.query.filter_by(
           post_id=blog_id,
           user_id=user_id
       ).first() is not None
       return jsonify({
           'isBookmarked': is_bookmarked,
           'message': f"Post {'bookmarked' if is_bookmarked else 'unbookmarked'} successfully"
       })
    except Exception as e:
       db.session.rollback()
       print(f"Error in handle_bookmark: {str(e)}")
       return jsonify({'error': str(e)}), 500

@app.route('/api/blogs/<int:blog_id>/bookmark', methods=['DELETE'])
def remove_bookmark():
    try:
        data = request.json
        user_id = data.get('user_id')
        post_id = data.get('post_id')

        if not user_id or not post_id:
            return jsonify({"message": "User ID and Post ID are required"}), 400

        # Fetch bookmark entry for the user
        bookmark = Bookmark.query.filter_by(user_id=user_id).first()
        if not bookmark:
            return jsonify({"message": "No bookmarks found for this user"}), 404

        # Remove the post_id if it exists
        if post_id in bookmark.post_ids:
            bookmark.post_ids.remove(post_id)
            db.session.commit()

        return jsonify({"message": "Bookmark removed successfully", "bookmarked_posts": bookmark.post_ids}), 200

    except Exception as e:
        print(f"Error removing bookmark: {e}")
        return jsonify({"error": "Failed to remove bookmark", "details": str(e)}), 500
    
@app.route('/api/bookmarks/<user_id>', methods=['GET'])
def get_bookmarks(user_id):
    try:
       # Get all bookmarks for the user
       bookmarks = Bookmark.query.filter_by(user_id=user_id).all()
       
       if not bookmarks:
           return jsonify({"message": "No bookmarks found"}), 200
        # Get all bookmarked blog posts
       bookmarked_blogs = []
       for bookmark in bookmarks:
           blog = BlogPost.query.filter_by(post_id=bookmark.post_id).first()
           if blog:
               blog_data = {
                   "post_id": blog.post_id,
                   "title": blog.title,
                   "content": blog.content,
                   "image_url": blog.image_url,
                   "category": blog.category,
                   "created_at": blog.created_at.strftime('%Y-%m-%d %H:%M:%S') if blog.created_at else None,
                   "author_id": blog.author_id,
                   "bookmark_date": bookmark.created_at.strftime('%Y-%m-%d %H:%M:%S')
               }
               bookmarked_blogs.append(blog_data)
       return jsonify({"bookmarked_blogs": bookmarked_blogs}), 200
    except Exception as e:
       print(f"Error fetching bookmarks: {e}")
       return jsonify({"error": "Failed to fetch bookmarks", "details": str(e)}), 500

@app.route('/api/blogs/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
   try:
       metrics = PostMetrics.query.filter_by(post_id=post_id).first()
       if not metrics:
           return jsonify([]), 200  # Return empty array if no metrics exist
       
       comments = metrics.comments if metrics.comments else []
       return jsonify(comments), 200
       
   except Exception as e:
       print(f"Error fetching comments: {e}")
       return jsonify({"error": str(e)}), 500

import requests,os
@app.route('/api/blogs/<int:post_id>/summarize', methods=['POST'])
def summarize_post(post_id):
    try:
        print(post_id)  # For debugging, check if post_id is correct

        # Validate post_id and fetch the blog post from the database
        blog_post = BlogPost.query.get_or_404(post_id)  # This automatically raises 404 if not found

        # Summarization API integration
        api_url = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn'  # Replace with your API URL
        headers = {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json',
        }

        MAX_INPUT_LENGTH = 1024  # Token limit for BART models
        input_text = blog_post.content
        trimmed_content = ' '.join(input_text.split()[:MAX_INPUT_LENGTH])
        payload = {
            "inputs": trimmed_content,
            "parameters": {
                "max_length": 600,  # Adjust the max length as needed
                "min_length": 50,
                "do_sample": False
            }
        }  # Send content as a plain string

        response = requests.post(api_url, headers=headers, json=payload)

        if response.status_code != 200:
            logging.error(f"Summarization API failed: {response.text}")
            return jsonify({'error': 'Failed to generate summary'}), response.status_code

        # Hugging Face API response is a list, not a dictionary
        response_data = response.json()
        if isinstance(response_data, list):
            summary_text = response_data[0].get('summary_text', '')
        else:
            return jsonify({'error': 'Summarization API did not return a valid summary'}), 500

        if not summary_text:
            return jsonify({'error': 'Summarization API did not return a summary'}), 500

        # Return the summary without saving it to the database
        return jsonify({'message': 'Summary generated successfully', 'summary': summary_text}), 200

    except Exception as e:
        logging.error(f"Error generating summary for post_id {post_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/authors/<author_id>', methods=['GET'])
def get_author_details(author_id):
    print(author_id)
    # Fetch user details from the User table
    author = User.query.filter_by(user_id=author_id).first_or_404()

    # Fetch blogs written by this author
    blogs = BlogPost.query.filter_by(author_id=author_id).all()

    # Return author details and their blogs
    return jsonify({
        'author': {
            'email_id': author.email_id,
            'name': author.user_name,  # Assuming the User table has a 'name' column
            # 'profile_picture': author.profile_picture_url  # Assuming a 'profile_picture_url' field
        },
        'blogs': [
            {
                'id': blog.post_id,
                'title': blog.title,
                'created_at': blog.created_at.strftime('%Y-%m-%d')
            }
            for blog in blogs
        ]
    })

@app.route('/api/track-read-time', methods=['POST'])
def track_read_time():
    try:
        data = request.get_json()
        post_id = data.get('postId')
        read_time = data.get('readTime')  # in seconds

        if not post_id or read_time is None:
            return jsonify({'error': 'Invalid data'}), 400

        # Fetch or create a PostAnalysis record for the post
        post_analysis = PostAnalysis.query.filter_by(post_id=post_id).first()

        if post_analysis:
            # Update avg_read_time (weighted average for existing records)
            total_reads = PostAnalysis.query.filter_by(post_id=post_id).count()
            total_read_time = (post_analysis.avg_read_time * total_reads) + read_time
            updated_avg_read_time = total_read_time // (total_reads + 1)

            post_analysis.avg_read_time = updated_avg_read_time
            print(f"Updated average read time for post {post_id}: {updated_avg_read_time}")  # Log the update
        else:
            # Create a new record for this post
            post_analysis = PostAnalysis(
                post_id=post_id,
                sentiment=None,  # Placeholder; update as needed
                avg_read_time=read_time,
                created_at=datetime.utcnow()
            )
            db.session.add(post_analysis)
            print(f"Created new post analysis for post {post_id} with read time: {read_time}")

        db.session.commit()
        return jsonify({'message': 'Read time updated successfully'}), 200

    except Exception as e:
        print(f"Error updating read time: {str(e)}")  # Log the error
        return jsonify({'error': str(e)}), 500



# API to fetch user info
@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'user_id': user.user_id,
        'user_name': user.user_name,
        'email_id': user.email_id,
        'is_admin': user.is_admin,
        'role': user.role,
        'created_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
           'profile_image': user.profile_image
    })

# API to update user info
@app.route('/api/user/<user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    user.user_name = data.get('user_name', user.user_name)
    user.email_id = data.get('email_id', user.email_id)
    
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{user_id}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            user.profile_image = filepath  # Save image path in DB

    db.session.commit()
    return jsonify({'message': 'User info updated successfully'})




def fetch_blog_data():
    blogs = BlogPost.query.all()
    blog_data = [{
        "post_id": blog.post_id,
        "title": blog.title,
        "content": blog.content
    } for blog in blogs]
    
    return pd.DataFrame(blog_data)

def fetch_user_interactions(user_id):
    liked_posts = Likes.query.filter_by(user_id=user_id).all()
    bookmarked_posts = Bookmark.query.filter_by(user_id=user_id).all()

    liked_ids = [like.blog_id for like in liked_posts]
    bookmarked_ids = [bookmark.post_id for bookmark in bookmarked_posts]
    
    return {"liked": liked_ids, "bookmarked": bookmarked_ids}

def get_similar_blogs(user_liked_posts, all_blogs_df):
    if not user_liked_posts:
        return []

    all_blogs_df["text"] = all_blogs_df["title"] + " " + all_blogs_df["content"]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(all_blogs_df["text"])

    # Get indices of user liked blogs
    liked_indices = all_blogs_df[all_blogs_df["post_id"].isin(user_liked_posts)].index

    # Compute similarity
    cosine_sim = cosine_similarity(tfidf_matrix[liked_indices], tfidf_matrix)
    similar_indices = cosine_sim.argsort()[:, -6:-1].flatten()

    # Return top 5 similar blogs
    return all_blogs_df.iloc[similar_indices][["post_id", "title"]].drop_duplicates().to_dict(orient="records")


@app.route('/api/recommendations/<string:user_id>', methods=['GET'])
def get_recommendations(user_id):
    # Fetch user interactions
    user_data = fetch_user_interactions(user_id)

    # Fetch all blogs
    all_blogs_df = fetch_blog_data()

    # Content-based filtering (similar blogs)
    similar_blogs = get_similar_blogs(user_data["liked"], all_blogs_df)

    # Collaborative Filtering (blogs liked by similar users)
    similar_users_blogs = Likes.query.filter(Likes.blog_id.in_(user_data["liked"])).all()
    recommended_blog_ids = list(set([like.blog_id for like in similar_users_blogs if like.user_id != user_id]))

# Fetch blog titles from the database
    recommended_blogs = db.session.query(BlogPost.post_id, BlogPost.title).filter(BlogPost.post_id.in_(recommended_blog_ids)).all()

# Convert query result to a list of dictionaries
    recommended_blogs = [{"post_id": blog.post_id, "title": blog.title} for blog in recommended_blogs]

    # Trending blogs
    # trending_blogs = BlogPost.query.order_by(PostMetrics.likes_count.desc(), PostMetrics.views_count.desc()).limit(5).all()
    trending_blogs = (
    db.session.query(BlogPost)
    .join(PostMetrics, BlogPost.post_id == PostMetrics.post_id)
    .order_by(PostMetrics.likes_count.desc(), PostMetrics.views_count.desc())
    .limit(5)
    .all()
)
    trending = [{"post_id": blog.post_id, "title": blog.title} for blog in trending_blogs]

    return jsonify({
        "similar_content_blogs": similar_blogs,
        "similar_users_blogs": recommended_blogs,
        "trending_blogs": trending
    })

if __name__ == "_main_":
    app.run(debug=True)