const Controller = require('./Controller');
const User = require('../models/User');
const UserException = require('../exceptions/UserException');
const HttpStatusCode = require('../helpers/HttpStatusCode');
const PostException = require('../exceptions/PostException');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

class UserController extends Controller {

    constructor(request, response, session){
        super(request, response,session);

        const requestMethod = this.request.getRequestMethod();
        
        this.response.setResponse({message: "Invalid request method!", statusCode: 405, payload: {} });
        this.action = this.error;

        if(requestMethod.toUpperCase() == "DELETE"){

            this.action = this.destroy;
        }
        else if (requestMethod.toUpperCase() == "GET"){
            if(request.getParameters().header[0] == "current")
            {
                this.action = this.getCurrentUser;
            }
            else if(request.getParameters().header[0] == "new"){
                this.action = this.getNewForm;
            }
            else if (request.getParameters().header.length == 1)
            {
                this.action = this.show;
            }
            else if(request.getParameters().header.length >= 2)
            {
                const method = request.getParameters().header[1];
                if(method == 'edit')
                    this.action = this.getEditForm;
                else if(method == 'postbookmarks')
                    this.action = this.getPostBookmarks;
                else if(method == 'commentbookmarks')
                    this.action = this.getCommentBookmarks;
                else if(method == 'commentvotes')
                    this.action = this.getCommentVotes;
                else if(method == 'postvotes')
                    this.action = this.getPostVotes;
                else if(method == 'comments')
                    this.action = this.getComments;
                else if(method == 'posts')
                    this.action = this.getPosts;
            }
            else
            {
                this.action = this.list
            }
            
        }
        else if (requestMethod.toUpperCase() == 'PUT'){
            this.action = this.edit;
            
        }
        else if (requestMethod.toUpperCase() == "POST"){
            this.action = this.new;
        }

        const profile = {link: `http://localhost:8000/user/${this.session.get('user_id')}`, name: "Profile"};
        
        this.header = [];

        if(this.session.get('user_id'))
            this.header.push(profile);
    }

    async getPostBookmarks(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        const thePosts = await Post.getBookmarkedPosts(userId);
        await this.response.setResponse({message: "User's post bookmarks were retrieved successfully!", statusCode: HttpStatusCode.OK, payload: thePosts, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }
    async getPostVotes(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        const thePosts = await Post.getVotedPosts(userId);
        await this.response.setResponse({message: "User's post votes were retrieved successfully!", statusCode: HttpStatusCode.OK, payload: thePosts, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async getCommentBookmarks(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        const theComments = await Comment.getBookmarkedComments(userId);
        await this.response.setResponse({message: "User's comment bookmarks were retrieved successfully!", statusCode: HttpStatusCode.OK, payload: theComments, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async getCommentVotes(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        const theComments = await Comment.getVotedComments(userId);
        await this.response.setResponse({message: "User's comment votes were retrieved successfully!", statusCode: HttpStatusCode.OK, payload: theComments, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async getComments(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        const theComments = await Comment.findByUser(userId);
        await this.response.setResponse({message: "User's comment were retrieved successfully!", statusCode: HttpStatusCode.OK, payload: theComments, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }


    async getPosts(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        const thePosts = await Post.findByUser(userId);
        await this.response.setResponse({message: "User's posts were retrieved successfully!", statusCode: HttpStatusCode.OK, payload: thePosts, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async getUser(){
        //const userId = this.session.get('user_id');
        let theUser = {};
        
        
        theUser = await User.findAll();
        

        await this.response.setResponse({message: "Users retrieved successfully!", statusCode: HttpStatusCode.OK, payload: theUser, isLoggedIn: this.session.exists('user_id')})
        return this.response;
    }

    async getCurrentUser(){
        const userId = this.session.get('user_id');
        let theUser = {};
        if(userId !== null)
        {
            theUser = await User.findById(userId);
        }

        await this.response.setResponse({message: "User retrieved", statusCode: HttpStatusCode.OK, payload: theUser, isLoggedIn: this.session.exists('user_id')})
        return this.response;
    }

    async getNewForm(){
        await this.response.setResponse({message: "Register", statusCode: 200, payload: {}, title: "NewForm", template: "User/NewFormView", isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async new(){
        const param = this.request.getParameters();
        const createdUser = await User.create(param.body.username, param.body.email, param.body.password);

        await this.response.setResponse({message: "User created successfully!", payload: createdUser, redirect: `auth/login`, title: createdUser.username});
        
        return this.response;
    }

    async list(){
        const foundUser = await User.findAll();
        await this.response.setResponse({message: "Users retrieved successfully!", statusCode: 200, payload: foundUser, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async show(){
        const param = this.request.getParameters();
        
        const foundUser = await User.findById(param.header[0]);
        if(foundUser == null)
        {
            throw new UserException(`Cannot retrieve User: User does not exist with ID ${param.header[0]}.`)
        }
        let isDeleted = false;

        let isLoggedIn = this.session.exists('user_id');

        if(foundUser.deletedAt)
        {
            isDeleted = true;
            isLoggedIn = false;
        }

        await this.response.setResponse({message: "User retrieved successfully!", statusCode: 200, payload: foundUser, title: foundUser.username, template: "User/ShowView", isDeleted: isDeleted, header: this.header, isLoggedIn: isLoggedIn });
        return this.response;
    }

    async getEditForm(){
        const param = this.request.getParameters();
        const user = await User.findById(parseInt(param.header[0]));
        
        await this.response.setResponse({message: `Edit ${user.getUsername()} user`, statusCode: 200, payload: user, title: "Edit Form", template: "User/EditFormView", isLoggedIn: this.session.exists('user_id')});

        return this.response;
    }

    async edit(){
        const param = this.request.getParameters();

        if(!this.session.exists("user_id"))
            throw new UserException("Cannot update User: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        let userToUpdate = await User.findById(param.header[0]);
        
        if(userToUpdate == null)
            throw new UserException(`Cannot update User: User does not exist with ID ${param.header[0]}.`);
        

        if(userToUpdate.id !== this.session.get("user_id"))
            throw new UserException("Cannot update User: You cannot update a user other than yourself.", HttpStatusCode.FORBIDDEN);


        //console.log(pokemonToUpdate);

        if(!param.body.username && !param.body.email && !param.body.password && !param.body.avatar)
        {
            throw new UserException('Cannot update User: No update parameters were provided.')
        }

        if(param.body.username)
        {
            userToUpdate.setUsername(param.body.username);
        }
        if(param.body.email)
        {
            userToUpdate.setEmail(param.body.email);
        }
        if(param.body.password)
        {
            userToUpdate.setPassword(param.body.password);
        }
        if(param.body.avatar)
        {
            userToUpdate.setAvatar(param.body.avatar);
        }
        
        await userToUpdate.save();
        await this.response.setResponse({message: "User updated successfully!", payload: userToUpdate, title: userToUpdate.getUsername(), redirect: `user/${userToUpdate.getId()}`})
        

        return this.response;


    }

    async destroy(){
        const param = this.request.getParameters();

        if(!this.session.exists("user_id"))
            throw new UserException("Cannot delete User: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        let userToDelete = await User.findById(param.header[0]);
    
        if(userToDelete == null)
            throw new UserException(`Cannot delete User: User does not exist with ID ${param.header[0]}.`);

        if(userToDelete.id !== this.session.get("user_id"))
            throw new UserException("Cannot delete User: You cannot delete a user other than yourself.", HttpStatusCode.FORBIDDEN);

         
        await userToDelete.remove();
        this.session.destroy();
        await this.response.setResponse({message: "User deleted successfully!", payload: userToDelete, redirect: `user/${userToDelete.id}`});

        return this.response;
        
    }


    setAction(action){
        this.action = action;
    }

    getAction(){
        return this.action;
    }

    async doAction(){
        try {
            const toReturn = await this.action();
            return toReturn;
        } catch (error) {
            throw new UserException(error.message, error.statusCode);
        }
        
    }

    async error(){
        await this.response.setResponse({message: "Invalid request method!", statusCode: 405, payload: {} })
        return this.response;
    }
}

module.exports = UserController;
