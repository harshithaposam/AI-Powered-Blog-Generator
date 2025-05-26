**About the Project:**
The Dynamic Blog Generator is an advanced platform engineered to streamline the process of blog creation and management, catering specifically to bloggers and small organizations with minimal technical expertise. Unlike traditional platforms that require considerable technical know-how or premium subscriptions, this system offers an intuitive interface, enabling effortless content input and automatic generation of responsive, visually appealing blog pages. The platform integrates cuttingedge technologies, including Artificial Intelligence (AI), Machine Learning (ML), and Natural Language Processing (NLP), to provide features such as multilingual support, content summarization, and AI-powered recommendations. Leveraging a robust backend powered by PostgreSQL and secure user authentication through Firebase, the system ensures data integrity and secure access control. The React-based frontend enhances user engagement with interactive elements like comments, likes, and
 sharing functionalities. This project not only addresses technical
 challenges but also promotes sustainability by reducing reliance
 on paper-based content creation, fostering creative expression,
 and facilitating knowledge sharing in a secure and user-friendly
 digital environment.

**To Create Schema on PostGreSQL:**
-- Creating User Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    email_id VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) CHECK (role IN ('user', 'admin', 'author')),
    admin_key VARCHAR(255) -- Will store the secured key for admin, can be NULL for non-admin
);

-- Creating Blog Post Table
CREATE TABLE blog_posts (
    post_id SERIAL PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    shares INT DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Creating Blog Comments Table
CREATE TABLE blog_comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment VARCHAR(255) NOT NULL,
    commented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Creating User Bookmarks Table
CREATE TABLE user_bookmarks (
    bookmark_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE
);

-- Creating Admin Dashboard Table
CREATE TABLE admin_dashboard (
    action_id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL,
    action_type VARCHAR(50) CHECK (action_type IN ('delete post', 'update post')),
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Creating Post Analysis Table
CREATE TABLE post_analysis (
    analysis_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares INT DEFAULT 0,
    average_read_time DECIMAL(5, 2) DEFAULT 0.00,
    FOREIGN KEY (post_id) REFERENCES blog_posts(post_id) ON DELETE CASCADE
);

CREATE TABLE admin_dashboard (
    action_id SERIAL PRIMARY KEY,
    admin_id VARCHAR(100) NOT NULL,
    blog_id INTEGER NULL,  
    action_type VARCHAR(100) NOT NULL,
    action_timestamp TIMESTAMP NOT NULL
);

**NOTE:**
replace the current firebase.json, SQLALCHEMY_DATABASE_UR and authorization key(line 676) with yours

**To Run Backend:**
cd backend
python app.py

**To Run Frontend:**
cd frontend
npm start
