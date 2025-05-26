import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Header } from "./components/header/Header";
import { Home } from "./pages/home/Home";
import { Login } from "./pages/login/Login"; // Import Login
import { Regsiter } from "./pages/login/Regsiter";
import { About } from "./pages/about/About";
import { BlogDetails } from "./pages/details/DetailsPages";
import { Account } from "./pages/account/Account";
import { CreateBlog } from "./components/create/Create";
import { Bookmark } from "./pages/Bookmarks/BookamrkedPages";
import { EditBlog } from "./pages/details/Editblog";
import { AuthorDetails } from "./pages/details/authorDetails";
import { Recommendations } from "./components/recommendations/Recommendations";
const App = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Regsiter} />
        <Route exact path="/details/:id" component={BlogDetails} />
        <Route exact path="/account" component={Account} />
        <Route exact path="/create" component={CreateBlog} />
        <Route exact path="/about" component={About} />
        <Route exact path="/bookmarks" component={Bookmark} />
        <Route exact path="/edit/:id" component={EditBlog} />
        <Route exact path="/authors/:authorId" component={AuthorDetails} />
    
      </Switch>
    </Router>
  );
};

export default App;
