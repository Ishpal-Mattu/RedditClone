const { throws } = require('assert');
const { type } = require('os');
const { promisify } = require('util');
const CategoryException = require('../exceptions/CategoryException');
const Model = require('./Model');
const User = require('./User');

class Category extends Model {
    constructor(id, title, description, created_by){
        super(id);
        this.title = title;
        this.description = description;
        this.created_by = created_by;
        this.user = null;
        //User.findById(this.created_by).then((result) => {this.user = result;});
    }

    getTitle(){
        return this.title;
    }
    setTitle(title){
        this.title = title;
    }
    getDescription(){
        return this.description;
    }
    setDescription(newDescription){
        this.description = newDescription;
    }

    getUser(){   
        
        return this.user;
    }

    setUser(user){
        this.user = user;
    }

    getUserId(){
        return this.created_by;
    }
    setUserId(id){
        this.created_by = id;
    }

    static async create(created_by, title, description){

        if(!title)
            throw new CategoryException("Cannot create Category: Missing title.");
        
        if(!created_by)
            throw new CategoryException("Cannot create Category: Missing userId.")

        if(!description)
            throw new CategoryException("Cannot create Category: Missing description.");
        
        if(await User.findById(created_by) == null)
            throw new CategoryException(`Cannot create Category: User does not exist with ID ${created_by}.`);

        const connection = await Model.connect();

        try {
            const sql = 'INSERT INTO `category` (title, description, user_id) VALUES (?, ?, ?);';
            await connection.execute(sql, [title, description, created_by]);

            let inserted = await this.findByTitle(title);
            
            const toReturn = new Category(inserted.getId(), inserted.getTitle(), inserted.getDescription(), inserted.getUserId());
            toReturn.setUser(await User.findById(inserted.getUserId()));
            return toReturn;

        } catch (error) {
            if(error.message.includes("title"))
                throw new CategoryException("Cannot create Category: Duplicate title.");
            else if(error.message.includes("user_id"))
                throw new CategoryException(`Cannot create Category: User does not exist with ID ${created_by}.`)
            else
                throw new CategoryException(error.message);
            
        }finally{
            await connection.end();
        }
        
    }

    static async findByTitle(title){
        if(!title)
            return null;

        const connection = await Model.connect();
        let result;
        try {
            const sql = 'SELECT * FROM `category` WHERE `title` = ?;';
            [result] = await connection.execute(sql, [title]);

            if(result.length <= 0)
                return null;

            let theCategory = new Category(result[0].id, result[0].title, result[0].description, result[0].user_id);

            theCategory.setCreatedAt(result[0].created_at);
            theCategory.setDeletedAt(result[0].deleted_at);
            theCategory.setEditedAt(result[0].edited_at);
            theCategory.setUser(await User.findById(result[0].user_id));

            return theCategory;

        } catch (error) {
            //console.log(error);
            return null;

        } finally{
            await connection.end();
        }
    }

    static async findById(id){
        if(!id)
            throw new CategoryException('Cannot retrieve Category: id cannot be blank')

        const connection = await Model.connect();
        let result;
        try {
            const sql = 'SELECT * FROM `category` WHERE `id` = ?;';
            [result] = await connection.execute(sql, [id]);

            if(result.length <= 0)
                return null

            let theCategory = new Category(result[0].id, result[0].title, result[0].description, result[0].user_id);

            theCategory.setCreatedAt(result[0].created_at);
            theCategory.setDeletedAt(result[0].deleted_at);
            theCategory.setEditedAt(result[0].edited_at);
            theCategory.setUser(await User.findById(result[0].user_id));

            return theCategory;

        } catch (error) {
            //console.log(error);
            return null

        } finally{
            await connection.end();
        }
    }


    static async findAll(){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `category`;';
		let results;

		let theCategory = [];

		try {
			
			[results] = await connection.execute(sql);

			
			for(let i = 0; i<results.length; i++){
				theCategory[i] = new Category(results[i].id, results[i].title, results[i].description, results[i].user_id);
                theCategory[i].setCreatedAt(results[i].created_at);
                theCategory[i].setDeletedAt(results[i].deleted_at);
                theCategory[i].setEditedAt(results[i].edited_at);
                theCategory[i].setUser(await User.findById(results[i].user_id));
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			return theCategory;

		} catch (error) {
			return theCategory;
		}
		finally{
			await connection.end();
			
		}
    }


    async save(){
        

        let sql;
        let info;
        
        if(!this.title)
        {
            throw new CategoryException("Cannot update Category: Missing title.")
        }

        const connection = await Model.connect();
        const toUpdate = await Category.findById(this.id);

        if(toUpdate == null)
        {
            await Category.create(this.created_by, this.title, this.description);
            await connection.end();
            return true;
        }
        else
        {
            // if(!this.id || !this.title)
            // {
            //     await connection.end();
            //     return false;
            // }
            
            if(!this.description.length && this.created_by.length > 0)
            {
                sql = 'UPDATE `category` SET `user_id` = ?, `title` = ?, `edited_at` = ? WHERE `id` = ?;';
                let editDate = new Date();
                info = [this.created_by, this.title, editDate.toISOString().slice(0,19).replace('T', ' '), this.id];
                //this.editedAt = editDate;
            }
            else if(!this.created_by && this.description.length > 0)
            {
                sql = 'UPDATE `category` SET `description` = ?, `title` = ?, `edited_at` = ? WHERE `id` = ?;';
                let editDate = new Date();
                info = [this.description, this.title, editDate.toISOString().slice(0,19).replace('T', ' '), this.id];
                //this.editedAt = editDate;
            }
            else if(this.created_by.length > 0 && this.description.length > 0)
            {
                sql = 'UPDATE `category` SET `user_id` = ?, `description` = ?, `title` = ?, `edited_at` = ? WHERE `id` = ?;';
                let editDate = new Date();
                info = [this.created_by, this.description, this.title, editDate.toISOString().slice(0,19).replace('T', ' '), this.id];
                //this.editedAt = editDate;
            }
            else
            {
                sql = 'UPDATE `category` SET `user_id` = ?, `description` = ?, `title` = ?, `edited_at` = ? WHERE `id` = ?;';
                let editDate = new Date();
                info = [this.created_by, this.description, this.title, editDate.toISOString().slice(0,19).replace('T', ' '), this.id];
                //this.editedAt = editDate;
            }
            
        }

        

        try {
            
            

            //const sql = 'UPDATE `category` SET `user_id` = ?, `title` = ?, `description` = ?, `created_at` = ?, `edited_at` = ?, deleted_at = ? WHERE `id` = ?;';
            //let editDate = new Date();
            //let deleteDate = null;
            // if(this.deletedAt !== null)
            // {
            //     deleteDate = this.deletedAt.toISOString().slice(0,19).replace('T', ' ');
            // }
            //let info = [this.created_by, this.title, this.description, this.createdAt.toISOString().slice(0,19).replace('T', ' '), editDate.toISOString().slice(0,19).replace('T', ' '), deleteDate, this.id];
            let result = await connection.execute(sql, info);
            
            if(result.length <= 0)
            {
                return false;
            }

            //this.editedAt = editDate;
            return true;


        } catch (error) {
            //console.log(error);
            return false;
        }
        finally{
            await connection.end();
        }

    }

    async remove(){
        const connection = await Model.connect();

        try {
            const deleteDate = new Date();
            const sql = 'UPDATE `category` SET `deleted_at` = ? WHERE `id` = ?;';
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

module.exports = Category;
