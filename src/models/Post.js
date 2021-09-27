const CategoryException = require('../exceptions/CategoryException');
const PostException = require('../exceptions/PostException');
const Category = require('./Category');
const Model = require('./Model');
const User = require('./User');

class Post extends Model {

    constructor(id, userId, categoryId, title, type, content, upVotes = 0, downVotes = 0){
        super(id);
        this.userId = userId
        this.categoryId = categoryId;
        this.title = title;
        this.type = type;
        this.content = content;
        this.user = null;
        this.category = null;
        this.upvotes = upVotes;
        this.downvotes = downVotes;
        this.totalVotes = 0;
    }

    
    getTitle(){
        return this.title;
    }
    setTitle(newTitle){
        this.title = newTitle;
    }

    getType(){
        return this.type;
    }
    setType(newType){
        this.type = newType;
    }

    getContent(){
        return this.content;
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

    getCategory(){
        return this.category;
    }

    getCategoryId(){
        return this.categoryId;
    }

    setCategory(category){
        this.category = category;
    }

    setContent(newContent){
        this.content = newContent;
    }

    getUpvotes(){
        return this.upvotes;
    }

    getDownvotes(){
        return this.downvotes;
    }

    static async create(userId, categoryId, title, type, content){
                
        if(!title)
            throw new PostException("Cannot create Post: Missing title.");
        
        if(!type)
            throw new PostException("Cannot create Post: Missing type.");
        
        if(!content)
            throw new PostException("Cannot create Post: Missing content.");

        const connection = await Model.connect();

        try {
            const sql = 'INSERT INTO `post` (`user_id`, `category_id`, `title`, `type`, `content`) VALUES (?, ?, ?, ?, ?);';
            let result = await connection.execute(sql, [userId, categoryId, title, type, content]);
            let inserted = await this.findById(result[0].insertId);

            const toReturn = new Post(inserted.getId(), inserted.getUserId(), inserted.getCategoryId(), inserted.getTitle(), inserted.getType(), inserted.getContent());
            toReturn.setUser(await User.findById(inserted.getUserId()));
            toReturn.setCategory(await Category.findById(inserted.getCategoryId()));
            return toReturn;
            

        } catch (error) {
            if(error.message.includes("category_id"))
                throw new PostException(`Cannot create Post: Category does not exist with ID ${categoryId}.`);

            else if(error.message.includes("user_id"))
                throw new PostException(`Cannot create Post: User does not exist with ID ${userId}.`);
            else
                throw new PostException(error.message);
        }finally{
            await connection.end();
        }
    }

    async isPostDownVoted(userId)
    {
        const connection = await Model.connect();
        const sql = 'SELECT * from `post_vote` WHERE `user_id` = ? AND `post_id` = ? AND `type` = ?';
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

    async isPostUpVoted(userId)
    {
        const connection = await Model.connect();
        const sql = 'SELECT * from `post_vote` WHERE `user_id` = ? AND `post_id` = ? AND `type` = ?';
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

    static async getBookmarkedPosts(userId){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `bookmarked_post` WHERE `user_id` = ?;';
		let results;
        const stuff = [userId];

		let thePost = [];

		try {
			
			[results] = await connection.execute(sql, stuff);

			let postsToAdd;
			for(let i = 0; i<results.length; i++){
                postsToAdd = await Post.findById(results[i].post_id);
				thePost.push(postsToAdd);
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

    async getTotalVotes(){
        const connection = await Model.connect();
        const sql = 'SELECT * from `post_vote` WHERE `post_id` = ? AND `type` = ?';
        let result;
        let theResult;
        try {
            [result] = await connection.execute(sql, [this.id, 'Up']);

            [theResult] = await connection.execute(sql, [this.id, 'Down']);

            return (result.length - theResult.length)


        } catch (error) {
            return 0;
        }
        finally{
            await connection.end();
        }
    }

    async isPostBookmarked(userId){
        const connection = await Model.connect();
        const sql = 'SELECT * from `bookmarked_post` WHERE `user_id` = ? AND `post_id` = ?';
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

    static async getVotedPosts(userId){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `post_vote` WHERE `user_id` = ?;';
		let results;
        const stuff = [userId];

		let thePost = [];

		try {
			
			[results] = await connection.execute(sql, stuff);

			let postsToAdd;
			for(let i = 0; i<results.length; i++){
                postsToAdd = await Post.findById(results[i].post_id);
				thePost.push(postsToAdd);
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
            const sql = 'INSERT INTO `bookmarked_post` (`user_id`, `post_id`) VALUES (?, ?);';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);
            //let inserted = await this.findById(result[0].insertId);

            //const toReturn = new Post(inserted.getId(), inserted.getUserId(), inserted.getCategoryId(), inserted.getTitle(), inserted.getType(), inserted.getContent());
            //toReturn.setUser(await User.findById(inserted.getUserId()));
            //toReturn.setCategory(await Category.findById(inserted.getCategoryId()));
            return result.affectedRows > 0
            

        } catch (error) {
            throw new PostException("Cannot bookmark Post: Post has already been bookmarked.");
        }finally{
            await connection.end();
        }
    }

    async unbookmark(userId)
    {
        const connection = await Model.connect();

        try {
            const sql = 'DELETE FROM `bookmarked_post` WHERE `user_id` = ? AND `post_id` = ?;';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);
            //let inserted = await this.findById(result[0].insertId);

            //const toReturn = new Post(inserted.getId(), inserted.getUserId(), inserted.getCategoryId(), inserted.getTitle(), inserted.getType(), inserted.getContent());
            //toReturn.setUser(await User.findById(inserted.getUserId()));
            //toReturn.setCategory(await Category.findById(inserted.getCategoryId()));
            if(result.affectedRows > 0)
                return true;
            else
                throw new PostException("Cannot unbookmark Post: Post has not been bookmarked.");
            

        } catch (error) {
            throw new PostException(error.message);
        }finally{
            await connection.end();
        }
    }

    async upVote(userId)
    {
        const connection = await Model.connect();

        try {
            let sql = 'SELECT `type` FROM `post_vote` WHERE `user_id` = ? AND `post_id` = ?';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);


            if(result.length <= 0)
            {
                sql = 'INSERT INTO `post_vote` (`user_id`, `post_id`, `type`) VALUES (?, ?, ?);';
                [result] = await connection.execute(sql, [userId, this.id, 'Up']);
                this.upvotes++;
                this.totalVotes = await this.getTotalVotes();
                return true;
            }
            else if(result[0].type !== 'Up')
            {
                sql = 'UPDATE `post_vote` SET `type` = ? WHERE `user_id` = ? AND `post_id` = ?;';
                [result] = await connection.execute(sql, ['Up', userId, this.id]);
                this.upvotes++;
                this.downvotes--;
                this.totalVotes = await this.getTotalVotes();
                return true;
            }

            throw new PostException("Cannot up vote Post: Post has already been up voted.");
            
        } catch (error) {
            throw new PostException(error.message);
        }finally{
            await connection.end();
        }
    }

    async downVote(userId)
    {
        const connection = await Model.connect();

        try {
            let sql = 'SELECT `type` FROM `post_vote` WHERE `user_id` = ? AND `post_id` = ?';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);

            

            if(result.length <= 0)
            {
                sql = 'INSERT INTO `post_vote` (`user_id`, `post_id`, `type`) VALUES (?, ?, ?);';
                [result] = await connection.execute(sql, [userId, this.id, 'Down']);
                this.downvotes++;
                this.totalVotes = await this.getTotalVotes();
                return true;
            }
            else if(result[0].type !== 'Down')
            {
                sql = 'UPDATE `post_vote` SET `type` = ? WHERE `user_id` = ? AND `post_id` = ?;';
                [result] = await connection.execute(sql, ['Down', userId, this.id]);
                this.downvotes++;
                this.upvotes--;
                this.totalVotes = await this.getTotalVotes();
                return true;
            }

            throw new PostException("Cannot down vote Post: Post has already been down voted.");

        }catch(error){
            throw new PostException(error.message);
        }finally{
            await connection.end();
        }  
    }
    
    async unvote(userId)
    {
        const connection = await Model.connect();

        try {
            let sql = 'SELECT `type` FROM `post_vote` WHERE `user_id` = ? AND `post_id` = ?';
            let result;
            [result] = await connection.execute(sql, [userId, this.id]);


            if(result.length <= 0)
            {
                throw new PostException('Cannot unvote Post: Post must first be up or down voted.');
            }
            else if(result[0].type == 'Down')
            {
                this.downvotes--;
            }
            else if(result[0].type == 'Up')
            {
                this.upvotes--;
            }

            sql = 'DELETE FROM `post_vote` WHERE `user_id` = ? AND `post_id` = ?';
            [result] = await connection.execute(sql, [userId, this.id]);

            this.totalVotes = await this.getTotalVotes();

            return true;

        }catch(error){
            throw new PostException(error.message);
        }finally{
            await connection.end();
        }  


    }

    static async findById(id){
        if(!id)
            return null;

        const connection = await Model.connect();
        let result;
        try {
            const sql = 'SELECT * FROM `post` WHERE `id` = ?;';
            [result] = await connection.execute(sql, [id]);

            if(result.length <= 0)
                return null;

            const upvotes = await Post.getNumVotes(result[0].id, 'Up');
            const downvotes = await Post.getNumVotes(result[0].id, 'Down');
            let thePost = new Post(result[0].id, result[0].user_id, result[0].category_id, result[0].title, result[0].type, result[0].content, upvotes, downvotes);

            thePost.setCreatedAt(result[0].created_at);
            thePost.setDeletedAt(result[0].deleted_at);
            thePost.setEditedAt(result[0].edited_at);
            thePost.setUser(await User.findById(result[0].user_id));
            thePost.setCategory(await Category.findById(result[0].category_id));

            return thePost;

        } catch (error) {
            //console.log(error);
            return null;

        } finally{
            await connection.end();
        }
    }

    static async getNumVotes(postId, type)
    {
        if(type !== 'Up' && type !== 'Down')
            throw new PostException("Type is not valid");

        const connection = await Model.connect();
        let result;
        try {
            const sql = 'SELECT * FROM `post_vote` WHERE `post_id` = ? AND `type` = ?;';
            [result] = await connection.execute(sql, [postId, type]);

            return result.length;

        } catch (error) {
            //console.log(error);
            return 0;

        } finally{
            await connection.end();
        }
        
    }

    static async findByCategory(categoryId){
        const connection = await Model.connect();
        let result;
        let thePost = [];
        try {
            const sql = 'SELECT * FROM `post` WHERE `category_id` = ?;';
            [result] = await connection.execute(sql, [categoryId]);

            for(let i = 0; i<result.length; i++){
                const upvotes = await Post.getNumVotes(result[i].id, 'Up');
                const downvotes = await Post.getNumVotes(result[i].id, 'Down');
				thePost.push(new Post(result[i].id, result[i].userId, result[i].categoryId, result[i].title, result[i].type, result[i].content, upvotes, downvotes));
                thePost[i].setCreatedAt(result[i].created_at);
                thePost[i].setDeletedAt(result[i].deleted_at);
                thePost[i].setEditedAt(result[i].edited_at);
                thePost[i].setUser(await User.findById(result[i].user_id));
                thePost[i].setCategory(await Category.findById(result[i].category_id));
            }

            

            return thePost;

        } catch (error) {
            //console.log(error);
            

        } finally{
            await connection.end();
        }
    }

    static async findByUser(userId){
        const connection = await Model.connect();
        let result;
        let thePost = [];
        try {
            const sql = 'SELECT * FROM `post` WHERE `user_id` = ?;';
            [result] = await connection.execute(sql, [userId]);

            for(let i = 0; i<result.length; i++){
                const upvotes = await Post.getNumVotes(result[i].id, 'Up');
                const downvotes = await Post.getNumVotes(result[i].id, 'Down');
				thePost.push(new Post(result[i].id, result[i].userId, result[i].categoryId, result[i].title, result[i].type, result[i].content, upvotes, downvotes));
                thePost[i].setCreatedAt(result[i].created_at);
                thePost[i].setDeletedAt(result[i].deleted_at);
                thePost[i].setEditedAt(result[i].edited_at);
                thePost[i].setUser(await User.findById(result[i].user_id));
                thePost[i].setCategory(await Category.findById(result[i].category_id));
            }

            

            return thePost;

        } catch (error) {
            //console.log(error);
            return thePost;

        } finally{
            await connection.end();
        }
    }

    static async findAll(){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `post`;';
		let results;

		let thePost = [];

		try {
			
			[results] = await connection.execute(sql);

			
			for(let i = 0; i<results.length; i++){
                const upvotes = await Post.getNumVotes(result[i].id, 'Up');
                const downvotes = await Post.getNumVotes(result[i].id, 'Down');
				thePost.push(new Post(results[i].id, results[i].userId, results[i].categoryId, results[i].title, results[i].type, results[i].content, upvotes, downvotes));
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

    async save(){
        

        let sql;
        let info;
        
        if(this.type.toUpperCase() == 'URL')
        {
            throw new PostException("Cannot update Post: Only text posts are editable.");
        }

        if(!this.content)
        {
            throw new PostException("Cannot update Post: Missing content.");
        }

        const connection = await Model.connect();
        const toUpdate = await Post.findById(this.id);

        if(toUpdate == null)
        {
            await Category.create(this.created_by, this.title, this.description);
            await connection.end();
            return true;
        }
        

        try {
            
            // if(this.type.toUpperCase() == 'TEXT' || !this.type)
            // {
            //     if(!this.id || !this.title || !this.content || !this.type || !this.categoryId)
            //     {
            //         return false;
            //     }
            // }
            // else if(this.type.toUpperCase() == 'URL')
            // {
            //     if(Post.isURL(this.content))
            //     {
            //         return false;
            //     }
            // }
            

            //const sql = 'UPDATE `post` SET `user_id` = ?, `category_id` = ?, `title` = ?, `type` = ?, `content` = ?, `edited_at` = ? WHERE `id` = ?;';
            
            const sql = 'UPDATE `post` SET `content` = ?, `edited_at` = ? WHERE `id` = ?;';
            
            let editDate = new Date();
            
            let info = [this.content, editDate.toISOString().slice(0,19).replace('T', ' '), this.id];
            let result = await connection.execute(sql, info);
            
            if(result.length <= 0)
            {
                return false;
            }

            this.editedAt = editDate;
            return true;


        } catch (error) {
            //console.log(error);
            return false;
        }
        finally{
            await connection.end();
        }

    }

    // Got this method from : https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
    static isURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    async remove(){
        const connection = await Model.connect();

        try {
            const deleteDate = new Date();
            const sql = 'UPDATE `post` SET `deleted_at` = ? WHERE `id` = ?;';
            let result = await connection.execute(sql, [deleteDate.toISOString().slice(0,19).replace('T', ' '), this.id]);

            if(result.length <= 0)
                return false;

            this.deletedAt = deleteDate;
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

module.exports = Post;
