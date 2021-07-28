const Controller = require('./Controller');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment')
const PostException = require('../exceptions/PostException');
const HttpStatusCode = require('../helpers/HttpStatusCode');

class PostController extends Controller {
    constructor(request, response, session){
        super(request, response, session);

        const requestMethod = this.request.getRequestMethod();
        
        this.response.setResponse({message: "Invalid request method!", statusCode: 405, payload: {} });
        this.action = this.error;
        this.headerLinks = [{link: "http://localhost:8000", name: "Home"}, {link: "http://localhost:8000/user/new", name: "Create User"}];

        if(requestMethod.toUpperCase() == "DELETE"){

            this.action = this.destroy;
        }
        else if (requestMethod.toUpperCase() == "GET"){
            if(request.getParameters().header[0] == "new"){
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
                else if(method == 'bookmark')
                    this.action = this.bookmark;
                else if(method == 'unbookmark')
                    this.action = this.unbookmark;
                else if(method == 'upvote')
                    this.action = this.upvote;
                else if(method == 'downvote')
                    this.action = this.downvote;
                else if(method == 'unvote')
                    this.action = this.unvote;
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
    }

    async bookmark(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');
        if(!userId)
            throw new PostException("Cannot bookmark Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let postToBookmark = {};
        try {
            postToBookmark = await Post.findById(param.header[0]);
            await postToBookmark.bookmark(userId);
        } catch (error) {
            throw new PostException(error.message);
        }

        await this.response.setResponse({message: "Post was bookmarked successfully!", payload: postToBookmark, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response;   
    }

    async unbookmark(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');
        if(!userId)
            throw new PostException("Cannot unbookmark Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let postToUnbookmark = {};
        try {
            postToUnbookmark = await Post.findById(param.header[0]);
            await postToUnbookmark.unbookmark(userId);
        } catch (error) {
            throw new PostException(error.message);
        }

        await this.response.setResponse({message: "Post was unbookmarked successfully!", payload: postToUnbookmark, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response; 
    }

    async upvote(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        if(!userId)
            throw new PostException("Cannot up vote Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let postToUpvote = {};
        try {
            postToUpvote = await Post.findById(param.header[0]);
            await postToUpvote.upVote(userId);
        } catch (error) {
            throw new PostException(error.message);
        }

        await this.response.setResponse({message: "Post was up voted successfully!", payload: postToUpvote, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response; 


    }

    async downvote(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        if(!userId)
            throw new PostException("Cannot down vote Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let postToDownvote = {};
        try {
            postToDownvote = await Post.findById(param.header[0]);
            await postToDownvote.downVote(userId);
        } catch (error) {
            throw new PostException(error.message);
        }

        await this.response.setResponse({message: "Post was down voted successfully!", payload: postToDownvote, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response; 
    }

    async unvote(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        if(!userId)
            throw new PostException("Cannot unvote Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let postToUnvote = {};
        try {
            postToUnvote = await Post.findById(param.header[0]);
            await postToUnvote.unvote(userId);
        } catch (error) {
            throw new PostException(error.message);
        }

        await this.response.setResponse({message: "Post was unvoted successfully!", payload: postToUnvote, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }


    async getNewForm(){

    }

    async new(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');
        if(!userId)
            throw new PostException("Cannot create Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        

        const createdPost = await Post.create(userId, param.body.categoryId, param.body.title, param.body.type, param.body.content);

        
        await this.response.setResponse({message: "Post created successfully!", payload: createdPost, redirect: `category/${createdPost.categoryId}`, isLoggedIn: this.session.exists('user_id')});
        
        
        return this.response;

    }

    async list(){
        const foundPost = await Post.findAll();
        await this.response.setResponse({message: "Posts retrieved successfully!", statusCode: 200, payload: foundPost, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async show(){
        const param = this.request.getParameters();
        const foundPost = await Post.findById(param.header[0]);
        if(foundPost == null)
        {
            throw new PostException(`Cannot retrieve Post: Post does not exist with ID ${param.header[0]}.`)
        }
        
        foundPost.isURL = foundPost.type.toUpperCase() == "URL";
        foundPost.isDeleted = foundPost.deletedAt != null;

        let postComments = await Comment.findByPost(foundPost.id)
        postComments = await Comment.getComments(null, foundPost.id);
        for(let i = 0; i < postComments.length; i++)
        {
            postComments[i].repliedToClass = `comment-${null}`
            postComments[i].idClass = `comment-${postComments[i].id}`
            postComments[i].offset = 0;
        }
        let currentId = 1;
        const maxId = await Comment.getMaxId(foundPost.id);
        let nextList;
        let currentIndex;

        while(currentId <= maxId)
        {
            nextList = await Comment.getComments(currentId, foundPost.id);

            if(nextList.length > 0)
            {
                currentIndex = postComments.findIndex(element => element.id == currentId)

                nextList = this.updateOffSet(nextList, postComments[currentIndex]);

                for(let i = 0; i<nextList.length; i++)
                {
                    nextList[i].repliedToClass = `comment-${currentId}`;
                    nextList[i].idClass = `comment-${nextList[i].id}`;
                }

                this.insertArrayAt(postComments, currentIndex+1, nextList);
            }
            currentId++;
        }

        const userId = this.session.get('user_id');

        for(let i = 0; i<postComments.length; i++)
        {
            postComments[i].isDeleted = postComments[i].deletedAt != null;
            postComments[i].isBookmarked = await postComments[i].isCommentBookmarked(userId);
            postComments[i].totalVotes = await postComments[i].getTotalVotes();
            postComments[i].isUpVoted = await postComments[i].isCommentUpVoted(userId);
            postComments[i].isDownVoted = await postComments[i].isCommentDownVoted(userId);
        }

        foundPost.isUpVoted = await foundPost.isPostUpVoted(userId);
        foundPost.isDownVoted = await foundPost.isPostDownVoted(userId);
        foundPost.totalVotes = await foundPost.getTotalVotes();

        const theHeader = this.headerLinks;
        theHeader.push({link: `http://localhost:8000/user/${userId}`, name: "My Profile"});

        await this.response.setResponse({message: "Post retrieved successfully!", statusCode: 200, payload: foundPost, isBookmarked: await foundPost.isPostBookmarked(userId), title: foundPost.title, template: "Post/ShowView", comments: postComments, isLoggedIn: this.session.exists('user_id'), header: theHeader});
        return this.response;
    }

    insertArrayAt(array, index, arrayToInsert) {
        Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
    }

    updateOffSet(nextList, object)
    {
        for(let i = 0; i<nextList.length; i++)
        {
            nextList[i].offset = object.offset + 1;
        }

        return nextList;
    }

    async getEditForm(){
        const param = this.request.getParameters();
        const post = await Post.findById(parseInt(param.header[0]));
        
        if(!this.session.exists("user_id"))
            throw new PostException("Cannot update Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        if(post == null)
            throw new PostException(`Cannot update Post: Post does not exist with ID ${param.header[0]}.`);

        if(post.getUserId() !== this.session.get("user_id"))
            throw new PostException("Cannot update Post: You cannot update a post created by someone other than yourself.", HttpStatusCode.FORBIDDEN);

       


        await this.response.setResponse({message: `Edit ${post.getTitle()} category`, statusCode: 200, payload: post, title: "Post Edit Form", template: "Post/EditView", isLoggedIn: this.session.exists('user_id')});

        return this.response;
    }

    async edit(){
        const param = this.request.getParameters();
        let postToUpdate = await Post.findById(param.header[0]);

        if(!this.session.exists("user_id"))
            throw new PostException("Cannot update Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        if(postToUpdate == null)
            throw new PostException(`Cannot update Post: Post does not exist with ID ${param.header[0]}.`);

        if(postToUpdate.getUserId() !== this.session.get("user_id"))
            throw new PostException("Cannot update Post: You cannot update a post created by someone other than yourself.", HttpStatusCode.FORBIDDEN);

   
        if(postToUpdate.getDeletedAt() !== null)
            throw new PostException("Cannot update Post: You cannot update a post that has been deleted.", HttpStatusCode.BAD_REQUEST);


        //console.log(pokemonToUpdate);

        if(!param.body.userId && !param.body.categoryId && !param.body.title && !param.body.type && !param.body.content)
        {
            throw new PostException('Cannot update Post: No update parameters were provided.')
        }

        if(param.body.userId)
        {
            postToUpdate.setUser(await User.findById(param.body.userId));
            postToUpdate.setUserId(param.body.userId)
        }
        if(param.body.categoryId)
        {
            postToUpdate.setCategory(param.body.categoryId);
        }
        if(param.body.title)
        {
            postToUpdate.setTitle(param.body.title);
        }
        if(param.body.type)
        {
            postToUpdate.setType(param.body.type);
        }
        if(param.body.content)
        {
            postToUpdate.setContent(param.body.content);
        }            
        
        const success = await postToUpdate.save();

        await this.response.setResponse({message: "Post updated successfully!", payload: postToUpdate, redirect: `post/${postToUpdate.id}`})
        
        return this.response;


    }

    async destroy(){
        const param = this.request.getParameters();

        if(!this.session.exists("user_id"))
            throw new PostException("Cannot delete Post: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        const postToDelete = await Post.findById(param.header[0]);

        if(postToDelete == null)
        {
            throw new PostException(`Cannot delete Post: Post does not exist with ID ${param.header[0]}.`)
        }

        if(postToDelete.getUserId() !== this.session.get("user_id"))
            throw new PostException("Cannot delete Post: You cannot delete a post created by someone other than yourself.", HttpStatusCode.FORBIDDEN);

        if(postToDelete.getDeletedAt() !== null)
            throw new PostException("Cannot delete Post: You cannot delete a post that has been deleted.", HttpStatusCode.BAD_REQUEST);


        await postToDelete.remove();
        await this.response.setResponse({message: "Post deleted successfully!", payload: postToDelete, redirect: `post/${postToDelete.id}`});
        
        return this.response;
        
    }


    setAction(action){
        this.action = action;
    }

    getAction(){
        return this.action;
    }

    async doAction(){
        return await this.action();
    }
}

module.exports = PostController;
