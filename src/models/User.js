const AuthException = require('../exceptions/AuthException');
const UserException = require('../exceptions/UserException');
const { connect } = require('./Model');
const Model = require('./Model');

class User extends Model {

    constructor(id, username, email, password){
        super(id);
        this.username = username;
        this.email = email;
        this.password = password;
        this.avatar = null;
        
    }
    getUsername(){
        return this.username;
    }
    setUsername(username){
        this.username = username;
    }

    setAvatar(avatar){
        this.avatar = avatar;
    }

    getAvatar(){
        return this.avatar;
    }

    getEmail(){
        return this.email;
    }
    setEmail(email){
        this.email = email;
    }

    getPassword(){
        return this.password;
    }
    setPassword(newPassword){
        this.password = newPassword;
    }

    // getPassword(){
    //     return this.password;
    // }

    static async create(username, email, password){
        

        if(!username)
        {
            throw new UserException("Cannot create User: Missing username.")
        }

        if(!email)
        {
            throw new UserException("Cannot create User: Missing email.");
        }

        if(!password)
        {
            throw new UserException("Cannot create User: Missing password.");
        }

        const connection = await Model.connect();
        try {
            const sql = 'INSERT INTO `user` (`username`, `email`, `password`) VALUES (?, ?, ?);';
        
            await connection.execute(sql, [username, email, password]);
            let inserted = await this.findByEmail(email);

            const toReturn = new User(inserted.getId(), inserted.getUsername(), inserted.getEmail(), inserted.getPassword());
            
            toReturn.setAvatar(inserted.getAvatar())
            return toReturn;

        } catch (error) {
            //console.log(error);
            if(error.message.includes("username"))
                throw new UserException("Cannot create User: Duplicate username.");
            else if(error.message.includes("email"))
                throw new UserException("Cannot create User: Duplicate email.")
            else
            {
                throw new UserException(error.message);
            }
        }
        finally
        {
            await connection.end();
        }

        /*
        const connection = await Model.connect();

        const sql = 'INSERT INTO `user` (username, email, password) VALUES (?, ?, ?);';
        
        connection.execute(sql, [username, email, password]);
        let inserted = await this.findByEmail(email);
        console.log(inserted);

        //let newUser = new User(inserted.id, inserted.username, inserted.email, inserted.password);
        await connection.end();
        return inserted;
        */
    }


    static async findById(id){
        const connection = await Model.connect();

		try {
            const sql = 'SELECT * FROM `user` WHERE `id` = ?;';
            let results;
			let theId = [id];
			[results] = await connection.execute(sql, theId);

			if(results.length <= 0)
            {
                return null;
            }

			let theUser = new User(results[0].id, results[0].username, results[0].email, results[0].password);

            theUser.setCreatedAt(results[0].created_at);
            theUser.setDeletedAt(results[0].deleted_at);
            theUser.setAvatar(results[0].avatar);
            theUser.setEditedAt(results[0].edited_at);

			return theUser;

		} catch (error) {
			//console.log(error);
			return null;
		}
		finally{
			await connection.end();
		}
    }

    static async findByEmail(email){
        const connection = await Model.connect();

		try {
            const sql = 'SELECT * FROM `user` WHERE `email` = ?;';
            let results;
			let stuff = [email];
			[results] = await connection.execute(sql, stuff);

			if(results <= 0)
            {
                throw new UserException(`Cannot retrieve User: User does not exist with email ${email}.`)
            }

			let theUser = new User(results[0].id, results[0].username, results[0].email, results[0].password);

            theUser.setCreatedAt(results[0].created_at);
            theUser.setAvatar(results[0].avatar);
            theUser.setDeletedAt(results[0].deleted_at);
            theUser.setEditedAt(results[0].edited_at);

			return theUser;

		} catch (error) {
			//console.log(error);
			return null;
		}
		finally{
			await connection.end();
		}
    }

    static async findByUsername(username){
        const connection = await Model.connect();

		try {
            const sql = 'SELECT * FROM `user` WHERE `username` = ?;';
            let results;
			let stuff = [username];
			[results] = await connection.execute(sql, stuff);

			if(results <= 0)
            {
                throw new UserException(`Cannot retrieve User: User does not exist with username ${username}.`)
            }

			let theUser = new User(results[0].id, results[0].username, results[0].email, results[0].password);

            theUser.setCreatedAt(results[0].created_at);
            theUser.setAvatar(results[0].avatar);
            theUser.setDeletedAt(results[0].deleted_at);
            theUser.setEditedAt(results[0].edited_at);

			return theUser;

		} catch (error) {
			//console.log(error);
			return null;
		}
		finally{
			await connection.end();
		}
    }

    static async findAll(){
        const connection = await Model.connect();

		//id = '1; DROP TABLE `pokemon`;';
		const sql = 'SELECT * FROM `user`;';
		let results;

		let theUser = [];

		try {
			
			[results] = await connection.execute(sql);

			
			for(let i = 0; i<results.length; i++){
				theUser.push(new User(results[i].id, results[i].username, results[i].email, results[i].password));
                theUser[i].setCreatedAt(results[i].created_at);
                theUser[i].setDeletedAt(results[i].deleted_at);
                theUser[i].setEditedAt(results[i].edited_at);
			}
			//newPokemon = new Pokemon(results[0].id, results[0].name, results[0].type);

			//return newPokemon;

		} catch (error) {
			
		}
		finally{
			await connection.end();
			return theUser;
		}
    }

    async save(){            
        if(!this.username)
        {
            throw new UserException("Cannot update User: Missing username.")
        }

        if(!this.email)
        {
            throw new UserException("Cannot update User: Missing email.")
        }
        
        const connection = await Model.connect();
        try{

            const sql = 'UPDATE `user` SET `username` = ?, `email` = ?, `password` = ?, `avatar` = ?, edited_at = ? WHERE `id` = ?;';
            let editDate = new Date();
            let info = [this.username, this.email, this.password, this.avatar, editDate.toISOString().slice(0,19).replace('T', ' '), this.id];
            let result = await connection.execute(sql, info);
            
            if(result.length <= 0)
            {
                return false;
            }

            this.editedAt = editDate;
            return true;


        } catch (error) {
            throw new UserException(error.message);
        }
        finally{
            await connection.end();
        }
    }

    async remove(){
        const connection = await Model.connect();

        try {
            const deleteDate = new Date();
            const sql = 'UPDATE `user` SET `deleted_at` = ? WHERE `id` = ?;';
            let result = await connection.execute(sql, [deleteDate.toISOString().slice(0,19).replace('T', ' '), this.id]);

            if(result.length <= 0)
                throw new UserException(`Cannot delete User: User does not exist with ID ${this.id}.`)

            this.setDeletedAt(deleteDate);
            return true;
            


        } catch (error) {
            throw new UserException(error.message);
        }
        finally{
            await connection.end();
        }
    }

    static async logIn(email, password)
    {
        
		const sql = 'SELECT * FROM `user` WHERE `email` = ?';
		let results;

        if(!email)
            throw new AuthException("Cannot log in: Missing email.");

        if(!password)
            throw new AuthException("Cannot log in: Missing password.");

        const connection = await Model.connect();
		try {
			let stuff = [email];
			[results] = await connection.execute(sql, stuff);

			if(results.length <= 0)
			{
                return null;
				//throw new AuthException("Cannot log in: Wrong email.")
			}

            if(results[0].password != password)
                return null;
                //throw new AuthException("Cannot log in: Wrong password.");

			let theUser = new User(results[0].id, results[0].username, results[0].email, results[0].password);

            theUser.setCreatedAt(results[0].created_at);
            theUser.setAvatar(results[0].avatar);
            theUser.setDeletedAt(results[0].deleted_at);
            theUser.setEditedAt(results[0].edited_at);

			return theUser;

		} catch (error) {
			throw new AuthException(error.message);
		}
		finally{
			await connection.end();
		}
    }
}

module.exports = User;
