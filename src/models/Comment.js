const CommentException = require('../exceptions/CommentException');
const Model = require('./Model');
const Post = require('./Post');
const User = require('./User');

class Comment extends Model {

    constructor(id, postId, userId, content, upVotes = 0, downVotes = 0){
        super(id);
        this.replyId = null;
        this.postId = postId;
        this.userId = userId;
        this.content = content;
        this.user = null;
        this.post = null;
        this.repliedComment = null;

        this.upvotes = upVotes;
        this.downvotes = downVotes;
    }

    getContent(){
        return this.content;
    }
    setContent(content){
        this.content = content;
    }
    getUser(){
        return this.user;
    }
    setUser(user){
        this.user = user;
    }

    getUserId(){
        return this.userId;
    }
    setUserId(id){
        this.userId = id;
    }

    getPost(){
        return this.post;
    }
    setPost(post){
        this.post = post;
    }


    getPostId(){
        return this.postId;
    }
    setPostId(id){
        this.postId = id;
    }

    getReplyId(){
        return this.replyId;
    }

    getRepliedTo(){
        return this.repliedComment;
    }
    setRepliedTo(repliedComment){
        this.repliedComment = repliedComment;
    }

    setReplyId(replyId){
        this.replyId = replyId;
    }

    getUpvotes(){
        return this.upvotes;
    }

    getDownvotes(){
        return this.downvotes;
    }

    static async create(userId, postId, content, replyId = null){
        if(!content)
            throw new CommentException("Cannot create Comment: Missing content.");

        let stuffToTest = await Post.findById(postId);
        if(stuffToTest == null)
            throw new CommentException(`Cannot create Comment: Post does not exist with ID ${postId}.`);

        stuffToTest = await User.findById(userId)
        if(stuffToTest == null)
            throw new CommentException(`Cannot create Comment: User does not exist with ID ${userId}.`);
        
        stuffToTest = await Comment.findById(replyId) 
        if(replyId != null &&  stuffToTest == null)
            throw new CommentException(`Cannot create Comment: Comment does not exist with ID ${replyId}.`)

        const connection = await Model.connect();

        try {
            const sql = 'INSERT INTO `comment` (post_id, user_id, content, reply_id) VALUES (?, ?, ?, ?);';
            let results;
            results = await connection.execute(sql, [postId, userId, content, replyId]);

            let inserted = await this.findById(results[0].insertId);

            const toReturn = new Comment(inserted.getId(), inserted.getPostId(), inserted.getUserId(), inserted.getContent());
            toReturn.setUser(await User.findById(inserted.getUserId()));
            toReturn.setPost(await Post.findById(inserted.getPostId()));
            toReturn.setRepliedTo(await Comment.findById(inserted.getReplyId()));
            
            return toReturn;

        } catch (error) {
            // if(error.message.includes("user_id"))
            //     throw new CommentException(`Cannot create Comment: User does not exist with ID ${userId}.`)

            // else if(error.message.includes("reply_id"))
            //     throw new CommentException(`Cannot create Comment: Comment does not exist with ID ${replyId}.`)

            // else if(error.message.includes("post_id"))
            //     throw new CommentException(`Cannot create Comment: Post does not exist with ID ${postId}.`)
            // else
                throw new CommentException(error.message);
            
        }finally{
            await connection.end();
        }
    }

    static async getBookmarkedComments(userId){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `bookmarked_comment` WHERE `user_id` = ?;';
		let results;
        const stuff = [userId];

		let theComments = [];

		try {
			
			[results] = await connection.execute(sql, stuff);

			let commentToAdd;
			for(let i = 0; i<results.length; i++){
                commentToAdd = await Comment.findById(results[i].comment_id);
				theComments.push(commentToAdd);
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			
		}
		finally{
			await connection.end();
			return theComments;
		}
    }

    static async getVotedComments(userId){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `comment_vote` WHERE `user_id` = ?;';
		let results;
        const stuff = [userId];

		let thePost = [];

		try {
			
			[results] = await connection.execute(sql, stuff);

			let commentToAdd;
			for(let i = 0; i<results.length; i++){
                commentToAdd = await Comment.findById(results[i].comment_id);
				thePost.push(commentToAdd);
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			
		}
		finally{
			await connection.end();
			return thePost;
		}
    }

    async bookmark(userId)
    {
        const connection = await Model.connect();

        try {
            const sql = 'INSERT INTO `bookmarked_comment` (`user_id`, `comment_id`) VALUES (?, ?);';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);
            //let inserted = await this.findById(result[0].insertId);

            //const toReturn = new Post(inserted.getId(), inserted.getUserId(), inserted.getCategoryId(), inserted.getTitle(), inserted.getType(), inserted.getContent());
            //toReturn.setUser(await User.findById(inserted.getUserId()));
            //toReturn.setCategory(await Category.findById(inserted.getCategoryId()));
            return result.affectedRows > 0
            

        } catch (error) {
            throw new CommentException("Cannot bookmark Comment: Comment has already been bookmarked.");
        }finally{
            await connection.end();
        }
    }

    async unbookmark(userId)
    {
        const connection = await Model.connect();

        try {
            const sql = 'DELETE FROM `bookmarked_comment` WHERE `user_id` = ? AND `comment_id` = ?;';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);
            //let inserted = await this.findById(result[0].insertId);

            //const toReturn = new Post(inserted.getId(), inserted.getUserId(), inserted.getCategoryId(), inserted.getTitle(), inserted.getType(), inserted.getContent());
            //toReturn.setUser(await User.findById(inserted.getUserId()));
            //toReturn.setCategory(await Category.findById(inserted.getCategoryId()));
            if(result.affectedRows > 0)
                return true;
            else
                throw new CommentException("Cannot unbookmark Comment: Comment has not been bookmarked.");
            

        } catch (error) {
            throw new CommentException(error.message);
        }finally{
            await connection.end();
        }
    }

    async upVote(userId)
    {
        const connection = await Model.connect();

        try {
            let sql = 'SELECT `type` FROM `comment_vote` WHERE `user_id` = ? AND `comment_id` = ?';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);

            if(result.length <= 0)
            {
                sql = 'INSERT INTO `comment_vote` (`user_id`, `comment_id`, `type`) VALUES (?, ?, ?);';
                [result] = await connection.execute(sql, [userId, this.id, 'Up']);
                this.upvotes++;
                return true;
            }
            else if(result[0].type !== 'Up')
            {
                sql = 'UPDATE `comment_vote` SET `type` = ? WHERE `user_id` = ? AND `comment_id` = ?;';
                [result] = await connection.execute(sql, ['Up', userId, this.id]);
                this.upvotes++;
                this.downvotes--;
                return true;
            }

            throw new CommentException("Cannot up vote Comment: Comment has already been up voted.");
            
        } catch (error) {
            throw new CommentException(error.message);
        }finally{
            await connection.end();
        }
    }

    async downVote(userId)
    {
        const connection = await Model.connect();

        try {
            let sql = 'SELECT `type` FROM `comment_vote` WHERE `user_id` = ? AND `comment_id` = ?';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);

            if(result.length <= 0)
            {
                sql = 'INSERT INTO `comment_vote` (`user_id`, `comment_id`, `type`) VALUES (?, ?, ?);';
                [result] = await connection.execute(sql, [userId, this.id, 'Down']);
                this.downvotes++;
                return true;
            }
            else if(result[0].type !== 'Down')
            {
                sql = 'UPDATE `comment_vote` SET `type` = ? WHERE `user_id` = ? AND `comment_id` = ?;';
                [result] = await connection.execute(sql, ['Down', userId, this.id]);
                this.downvotes++;
                this.upvotes--;
                return true;
            }

            throw new CommentException("Cannot down vote Comment: Comment has already been down voted.");
            
        } catch (error) {
            throw new CommentException(error.message);
        }finally{
            await connection.end();
        }
    }

    async unvote(userId)
    {
        const connection = await Model.connect();

        try {
            let sql = 'SELECT `type` FROM `comment_vote` WHERE `user_id` = ? AND `comment_id` = ?';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);

            if(result.length <= 0)
            {
                throw new CommentException('Cannot unvote Comment: Comment must first be up or down voted.');
            }
            else if(result[0].type == 'Down')
            {
                this.downvotes--;
            }
            else if(result[0].type == 'Up')
            {
                this.upvotes--;
            }

            sql = 'DELETE FROM `comment_vote` WHERE `user_id` = ? AND `comment_id` = ?';
            [result] = await connection.execute(sql, [userId, this.id]);

            return true;

        }catch(error){
            throw new CommentException(error.message);
        }finally{
            await connection.end();
        }
    }  

    static async getNumVotes(commentId, type)
    {
        if(type !== 'Up' && type !== 'Down')
            throw new PostException("Type is not valid");

        const connection = await Model.connect();
        let result;
        try {
            const sql = 'SELECT * FROM `comment_vote` WHERE `comment_id` = ? AND `type` = ?;';
            [result] = await connection.execute(sql, [commentId, type]);

            return result.length;

        } catch (error) {
            //console.log(error);
            return 0;

        } finally{
            await connection.end();
        }
        
    }

    static async findById(id){
        if(!id)
            return null;

        const connection = await Model.connect();
        let result;
        try {
            const sql = 'SELECT * FROM `comment` WHERE `id` = ?;';
            [result] = await connection.execute(sql, [id]);

            if(result.length <= 0)
                return null;

            const upvotes = await Comment.getNumVotes(result[0].id, 'Up');
            const downvotes = await Comment.getNumVotes(result[0].id, 'Down');
            let theComment = new Comment(result[0].id, result[0].post_id, result[0].user_id, result[0].content, upvotes, downvotes);

            theComment.setCreatedAt(result[0].created_at);
            theComment.setDeletedAt(result[0].deleted_at);
            theComment.setEditedAt(result[0].edited_at);
            theComment.setReplyId(result[0].reply_id);
            theComment.setUser(await User.findById(result[0].user_id));
            theComment.setRepliedTo(await Comment.findById(result[0].reply_id));
            theComment.setPost(await Post.findById(result[0].post_id));
            return theComment;

        } catch (error) {
            //console.log(error);
            return null;

        } finally{
            await connection.end();
        }
    }

    static async findAll(){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `comment`;';
		let results;

		let theComment = [];

		try {
			
			[results] = await connection.execute(sql);

			
			for(let i = 0; i<results.length; i++){
                const upvotes = await Comment.getNumVotes(results[i].id, 'Up');
                const downvotes = await Comment.getNumVotes(results[i].id, 'Down');
				theComment.push(new Comment(results[i].id, results[i].post_id, results[i].user_id, results[i].content, upvotes, downvotes));
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			
		}
		finally{
			await connection.end();
			return theComment;
		}
    }

    static async findByPost(postId){
        const connection = await Model.connect();
        if(!postId)
            throw new CommentException("post id is not given");
		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `comment` where `post_id` = ?';
		let results;

		let theComment = [];

		try {
			
			[results] = await connection.execute(sql, [postId]);

			
			for(let i = 0; i<results.length; i++){
                const upvotes = await Comment.getNumVotes(results[i].id, 'Up');
                const downvotes = await Comment.getNumVotes(results[i].id, 'Down');

				theComment.push(new Comment(results[i].id, results[i].post_id, results[i].user_id, results[i].content, upvotes, downvotes));
                theComment[i].setCreatedAt(results[i].created_at);
                theComment[i].setDeletedAt(results[i].deleted_at);
                theComment[i].setEditedAt(results[i].edited_at);
                theComment[i].setReplyId(results[i].reply_id);
                theComment[i].setUser(await User.findById(results[i].user_id));
                theComment[i].setRepliedTo(await Comment.findById(results[i].reply_id));
                theComment[i].setPost(await Post.findById(results[i].post_id));
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			throw new CommentException(error.message);
		}
		finally{
			await connection.end();
			return theComment;
		}
    }

    static async findByUser(userId){
        const connection = await Model.connect();
        if(!userId)
            throw new CommentException("user id is not given");
		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `comment` where `user_id` = ?';
		let results;

		let theComment = [];

		try {
			
			[results] = await connection.execute(sql, [userId]);

			
			for(let i = 0; i<results.length; i++){
                const upvotes = await Comment.getNumVotes(results[i].id, 'Up');
                const downvotes = await Comment.getNumVotes(results[i].id, 'Down');

				theComment.push(new Comment(results[i].id, results[i].post_id, results[i].user_id, results[i].content, upvotes, downvotes));
                theComment[i].setCreatedAt(results[i].created_at);
                theComment[i].setDeletedAt(results[i].deleted_at);
                theComment[i].setEditedAt(results[i].edited_at);
                theComment[i].setReplyId(results[i].reply_id);
                theComment[i].setUser(await User.findById(results[i].user_id));
                theComment[i].setRepliedTo(await Comment.findById(results[i].reply_id));
                theComment[i].setPost(await Post.findById(results[i].post_id));
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			throw new CommentException(error.message);
		}
		finally{
			await connection.end();
			return theComment;
		}
    }

    async isCommentBookmarked(userId)
    {
        const connection = await Model.connect();
        const sql = 'SELECT * from `bookmarked_comment` WHERE `user_id` = ? AND `comment_id` = ?';
        let result;
        try {
            [result] = await connection.execute(sql, [userId, this.id]);
            if(result.length > 0)
                return true;
            
            return false;


        } catch (error) {
            return false;
        }
        finally{
            await connection.end();
        }
    }

    async getTotalVotes(){
        const connection = await Model.connect();
        const sql = 'SELECT * from `comment_vote` WHERE `comment_id` = ? AND `type` = ?';
        let result;
        let theResult
        try {
            [result] = await connection.execute(sql, [this.id, 'Up']);
            const upVotes = result.length;

            result = null;
            [theResult] = await connection.execute(sql, [this.id, 'Down']);
            const downVotes = theResult.length;

            return (upVotes - downVotes);


        } catch (error) {
            return 0;
        }
        finally{
            await connection.end();
        }
    }

    async isCommentUpVoted(userId)
    {
        const connection = await Model.connect();
        const sql = 'SELECT * from `comment_vote` WHERE `user_id` = ? AND `comment_id` = ? AND `type` = ?';
        let result;
        try {
            [result] = await connection.execute(sql, [userId, this.id, 'Up']);
            if(result.length > 0)
                return true;
            
            return false;


        } catch (error) {
            return false;
        }
        finally{
            await connection.end();
        }
    }

    async isCommentDownVoted(userId)
    {
        const connection = await Model.connect();
        const sql = 'SELECT * from `comment_vote` WHERE `user_id` = ? AND `comment_id` = ? AND `type` = ?';
        let result;
        try {
            [result] = await connection.execute(sql, [userId, this.id, 'Down']);
            if(result.length > 0)
                return true;
            
            return false;


        } catch (error) {
            return false;
        }
        finally{
            await connection.end();
        }
    }

    static async getComments(replyId, postId)
    {
        const connection = await Model.connect();

        let sql;
        let stuff;
        if(replyId == null)
        {
            sql = 'SELECT * FROM `comment` WHERE reply_id IS NULL AND post_id = ?';
            stuff = [postId];
        }
        else
        {
            sql = 'SELECT * FROM `comment` WHERE reply_id = ? AND post_id = ?';
            stuff = [replyId, postId];
        }
            
		//id = '1; DROP TABLE `pokemon`;';
		
		let results;

		let theReplies = [];

		try {
			
			[results] = await connection.execute(sql, stuff);

			
			for(let i = 0; i<results.length; i++){
                const upvotes = await Comment.getNumVotes(results[i].id, 'Up');
                const downvotes = await Comment.getNumVotes(results[i].id, 'Down');
				theReplies.push(new Comment(results[i].id, results[i].post_id, results[i].user_id, results[i].content, upvotes, downvotes));
                theReplies[i].setCreatedAt(results[i].created_at);
                theReplies[i].setDeletedAt(results[i].deleted_at);
                theReplies[i].setEditedAt(results[i].edited_at);
                theReplies[i].setReplyId(results[i].reply_id);
                theReplies[i].setUser(await User.findById(results[i].user_id));
                theReplies[i].setRepliedTo(await Comment.findById(results[i].reply_id));
                theReplies[i].setPost(await Post.findById(results[i].post_id));
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			
		}
		finally{
			await connection.end();
			return theReplies;
		}
    }

    static async getMaxId(postId)
    {
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT COUNT(id) as `numElement` from `comment` WHERE `post_id` = ?';
		let results;

		//let theReplies = [];

		try {
			
			[results] = await connection.execute(sql, [postId]);

			
			return results[0].numElement;
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			
		}
		finally{
			await connection.end();
			//return theReplies;
		}
    }

    async getAllReplies(){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `comment` where `reply_id` = ?';
		let results;

		let theReplies = [];

		try {
			
			[results] = await connection.execute(sql, [this.id]);

			
			for(let i = 0; i<results.length; i++){
				theReplies.push(new Comment(results[i].id, results[i].post_id, results[i].user_id, results[i].content));
                theReplies[i].setCreatedAt(results[i].created_at);
                theReplies[i].setDeletedAt(results[i].deleted_at);
                theReplies[i].setEditedAt(results[i].edited_at);
                theReplies[i].setReplyId(results[i].reply_id);
                theReplies[i].setUser(await User.findById(results[i].user_id));
                theReplies[i].setRepliedTo(await Comment.findById(results[i].reply_id));
                theReplies[i].setPost(await Post.findById(results[i].post_id));
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			
		}
		finally{
			await connection.end();
			return theReplies;
		}
    }

    async save(){
        
        if(!this.content || !this.postId || !this.userId)
        {
            throw new CommentException("Cannot update Comment: Missing content.");
        }

        const connection = await Model.connect();
        
        try {
            const sql = 'UPDATE `comment` SET `post_id` = ?, `user_id` = ?, `reply_id` = ?, `content` = ?, `edited_at` = ? WHERE `id` = ?;';
            let editDate = new Date();
            let deleteDate = null;
            if(this.deletedAt !== null)
            {
                deleteDate = this.deletedAt.toISOString().slice(0,19).replace('T', ' ');
            }
            let info = [this.postId, this.userId, this.replyId, this.content, editDate.toISOString().slice(0,19).replace('T', ' '), this.id];
            let result = await connection.execute(sql, info);
            
            if(result.length <= 0)
            {
                return false;
            }

            this.editedAt = editDate;
            return true;


        } catch (error) {
            if(error.message.includes("user_id"))
                throw new CommentException(`Cannot update Comment: User does not exist with ID ${this.userId}.`)

            else if(error.message.includes("reply_id"))
                throw new CommentException(`Cannot update Comment: Comment does not exist with ID ${this.replyId}.`)

            else if(error.message.includes("post_id"))
                throw new CommentException(`Cannot update Comment: Post does not exist with ID ${this.postId}.`)
            else
                throw new CommentException(error.message);
        }
        finally{
            await connection.end();
        }

    }

    async remove(){
        const connection = await Model.connect();

        try {
            const deleteDate = new Date();
            const sql = 'UPDATE `comment` SET `deleted_at` = ? WHERE `id` = ?;';
            let result = await connection.execute(sql, [deleteDate.toISOString().slice(0,19).replace('T', ' '), this.id]);

            if(result.length <= 0)
                return false;

            this.setDeletedAt(deleteDate);
            return true;
            


        } catch (error) {
            //console.log(error)
            return false;
        }
        finally{
            await connection.end();
        }
    }
}

module.exports = Comment;
