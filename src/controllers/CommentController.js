const Controller = require('./Controller');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const CommentException = require('../exceptions/CommentException');
const HttpStatusCode = require('../helpers/HttpStatusCode');

class CommentController extends Controller {
    constructor(request, response, session){
        super(request, response, session);
        this.headerLinks = [{link: "http://localhost:8000", name: "Home"}, {link: "http://localhost:8000/user/new", name: "Create User"}];

        const requestMethod = this.request.getRequestMethod();
        
        this.response.setResponse({message: "Invalid request method!", statusCode: 405, payload: {} });
        this.action = this.error;

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
                    this.action = this.upVote;
                else if(method == 'downvote')
                    this.action = this.downVote;
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
            throw new CommentException("Cannot bookmark Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let commentToBookmark = {};
        try {
            commentToBookmark = await Comment.findById(param.header[0]);
            await commentToBookmark.bookmark(userId);
        } catch (error) {
            throw new CommentException(error.message);
        }

        await this.response.setResponse({message: "Comment was bookmarked successfully!", payload: commentToBookmark, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response; 
    }

    async unbookmark()
    {
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');
        if(!userId)
            throw new CommentException("Cannot unbookmark Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let commentToUnbookmark = {};
        try {
            commentToUnbookmark = await Comment.findById(param.header[0]);
            await commentToUnbookmark.unbookmark(userId);
        } catch (error) {
            throw new CommentException(error.message);
        }

        await this.response.setResponse({message: "Comment was unbookmarked successfully!", payload: commentToUnbookmark, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response; 
    }

    async upVote(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        if(!userId)
            throw new CommentException("Cannot up vote Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let commentToUpvote = {};
        try {
            commentToUpvote = await Comment.findById(param.header[0]);
            await commentToUpvote.upVote(userId);
        } catch (error) {
            throw new CommentException(error.message);
        }

        await this.response.setResponse({message: "Comment was up voted successfully!", payload: commentToUpvote, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response;


    }

    async downVote(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        if(!userId)
            throw new CommentException("Cannot down vote Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let commentToDownvote = {};
        try {
            commentToDownvote = await Comment.findById(param.header[0]);
            await commentToDownvote.downVote(userId);
        } catch (error) {
            throw new CommentException(error.message);
        }

        await this.response.setResponse({message: "Comment was down voted successfully!", payload: commentToDownvote, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async unvote(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');

        if(!userId)
            throw new CommentException("Cannot unvote Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        let commentToUnvote = {};
        try {
            commentToUnvote = await Comment.findById(param.header[0]);
            await commentToUnvote.unvote(userId);
        } catch (error) {
            throw new CommentException(error.message);
        }

        await this.response.setResponse({message: "Comment was unvoted successfully!", payload: commentToUnvote, statusCode:HttpStatusCode.OK, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }



    async getNewForm(){

    }

    async new(){
        const param = this.request.getParameters();
        let replyId = null;
        if(!param.body.replyId)
            replyId = null;
        else
            replyId = param.body.replyId;

        const userId = this.session.get('user_id');
        if(!userId)
            throw new CommentException("Cannot create Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
            
        if(!await Post.findById(param.body.postId))
            throw new CommentException(`Cannot create Comment: Post does not exist with ID ${param.body.postId}.`, HttpStatusCode.BAD_REQUEST)

        const createdComment = await Comment.create(userId, param.body.postId, param.body.content, replyId); 

        await this.response.setResponse({message: "Comment created successfully!", payload: createdComment, redirect: `post/${createdComment.postId}`});
        return this.response;

    }

    async list(){
        const foundComment = await Comment.findAll();
        this.response.setResponse({message: "Comments retrieved successfully!", statusCode: 200, payload: foundComment, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async show(){
        const param = this.request.getParameters();
        const foundComment = await Comment.findById(param.header[0]);

        if(foundComment == null)
        {
            throw new CommentException(`Cannot retrieve Comment: Comment does not exist with ID ${param.header[0]}.`)
        }

        // const commentReplies = await foundComment.getAllReplies();

        
        let commentReplies = await Comment.getComments(foundComment.id, foundComment.postId);
        for(let i = 0; i < commentReplies.length; i++)
        {
            // commentReplies[i].repliedToClass = `comment-${null}`
            // commentReplies[i].idClass = `comment-${commentReplies[i].id}`
            commentReplies[i].offset = 1;
        }
        let currentId = null;
        if(commentReplies.length > 0)
            currentId = commentReplies[0].id;
        //const maxId = await Comment.getMaxId(foundPost.id);
        let nextList;
        let currentIndex;
        let emptyCounter = 0;

        while(true && currentId != null)
        {
            nextList = await Comment.getComments(currentId, foundComment.postId);

            if(nextList.length > 0)
            {
                currentIndex = commentReplies.findIndex(element => element.id == currentId)

                nextList = this.updateOffSet(nextList, commentReplies[currentIndex]);

                // for(let i = 0; i<nextList.length; i++)
                // {
                //     nextList[i].repliedToClass = `comment-${currentId}`;
                //     nextList[i].idClass = `comment-${nextList[i].id}`;
                // }

                this.insertArrayAt(commentReplies, currentIndex+1, nextList);
                emptyCounter = 0;
            }
            else
            {
                emptyCounter++;
            }

            if(emptyCounter >= commentReplies.length)
                break;

            

            currentId++;
        }

        const userId = this.session.get('user_id');
        foundComment.isDownVoted = await foundComment.isCommentDownVoted(userId);
        foundComment.isUpVoted = await foundComment.isCommentUpVoted(userId);
        foundComment.totalVotes = await foundComment.getTotalVotes();

        const theHeader = this.headerLinks;
        theHeader.push({link: `http://localhost:8000/user/${userId}`, name: "My Profile"});

        await this.response.setResponse({message: "Comment retrieved successfully!", statusCode: 200, payload: foundComment, template: "Comment/ShowView", title: "See comment", replies: commentReplies, isLoggedIn: this.session.exists('user_id'), header: theHeader});
        
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
        const comment = await Comment.findById(parseInt(param.header[0]));
        
        if(!this.session.exists("user_id"))
            throw new CommentException("Cannot update Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        if(comment == null)
            throw new CommentException(`Cannot update Comment: Comment does not exist with ID ${param.header[0]}.`);

        if(comment.getUserId() !== this.session.get("user_id"))
            throw new CommentException("Cannot update Comment: You cannot update a comment created by someone other than yourself.", HttpStatusCode.FORBIDDEN);


        await this.response.setResponse({message: 'Edit comment', statusCode: 200, payload: comment, title: "Edit Form", template: "Comment/EditView", isLoggedIn: this.session.exists('user_id')});

        return this.response;
    }

    async edit(){
        const param = this.request.getParameters();
        let commentToUpdate = await Comment.findById(param.header[0]);

        if(!this.session.exists("user_id"))
            throw new CommentException("Cannot update Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        if(commentToUpdate == null)
            throw new CommentException(`Cannot update Comment: Comment does not exist with ID ${param.header[0]}.`);

        if(commentToUpdate.getUserId() !== this.session.get("user_id"))
            throw new CommentException("Cannot update Comment: You cannot update a comment created by someone other than yourself.", HttpStatusCode.FORBIDDEN);


        if(!param.body.postId && !param.body.userId && !param.body.replyId && !param.body.content)
        {
            throw new CommentException('Cannot update Comment: No update parameters were provided.');
        }

        if(commentToUpdate.getDeletedAt() !== null)
            throw new CommentException("Cannot update Comment: You cannot update a comment that has been deleted.", HttpStatusCode.BAD_REQUEST);



        if(param.body.postId)
        {
            commentToUpdate.setPost(await Post.findById(param.body.postId));
            commentToUpdate.setPostId(param.body.postId);
        }
        if(param.body.userId)
        {
            commentToUpdate.setUser(User.findByEmail(param.body.userId));
            commentToUpdate.setUserId(param.body.userId);
        }
        if(param.body.replyId)
        {
            commentToUpdate.setReplyId(param.body.replyId);
            commentToUpdate.setRepliedTo(await Comment.findById(param.body.replyId));
        }
        if(param.body.content)
        {
            commentToUpdate.setContent(param.body.content);
        }
                
        const success = await commentToUpdate.save();

        await this.response.setResponse({message: "Comment updated successfully!", payload: commentToUpdate, redirect: `post/${commentToUpdate.postId}`})
        return this.response;


    }

    async destroy(){
        const param = this.request.getParameters();

        if(!this.session.exists("user_id"))
            throw new CommentException("Cannot delete Comment: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        const commentToDelete = await Comment.findById(param.header[0]);

        if(commentToDelete == null)
        {
            throw new CommentException(`Cannot delete Comment: Comment does not exist with ID ${param.header[0]}.`)
        }

        if(commentToDelete.getUserId() !== this.session.get("user_id"))
            throw new CommentException("Cannot delete Comment: You cannot delete a comment created by someone other than yourself.", HttpStatusCode.FORBIDDEN);

        if(commentToDelete.getDeletedAt() !== null)
            throw new CommentException("Cannot delete Comment: You cannot delete a comment that has been deleted.", HttpStatusCode.BAD_REQUEST);

       
        await commentToDelete.remove();
        await this.response.setResponse({message: "Comment deleted successfully!", payload: commentToDelete, redirect: `post/${commentToDelete.postId}`});
        
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
            return await this.action();
        } catch (error) {
            throw new CommentException(error.message, error.statusCode);
        }
        
        
        
    }
}

module.exports = CommentController;
