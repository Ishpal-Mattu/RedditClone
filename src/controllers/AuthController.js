const Cookie = require("../auth/Cookie");
const AuthException = require("../exceptions/AuthException");
const HttpStatusCode = require("../helpers/HttpStatusCode");
const User = require("../models/User");
const Controller = require("./Controller");

class AuthController extends Controller
{
    constructor(request, response, session){
        super(request, response, session);

        const requestMethod = this.request.getRequestMethod();
        
        this.response.setResponse({message: "Invalid request method!", statusCode: 405, payload: {} });
        this.action = this.error;

        if(requestMethod.toUpperCase() == "DELETE"){

            this.action = this.destroy;
        }
        else if (requestMethod.toUpperCase() == "GET"){
            if(request.getParameters().header[0] == "register"){
                this.action = this.getRegisterForm;
            }
            else if(request.getParameters().header[0] == "login"){
                this.action = this.getLoginForm;
            }
            else if(request.getParameters().header[0] == "logout"){
                this.action = this.logOut;
            }
            else if (request.getParameters().header.length == 1)
            {
                this.action = this.show;
            }
            else if(request.getParameters().header.length >= 2)
            {
                this.action = this.getEditForm;
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
            this.action = this.logIn;
        }
    }

    async getNewForm(){
        await this.response.setResponse({message: "Register", statusCode: 200, payload: {}, title: "NewForm", template: "User/NewFormView"});
        return this.response;
    }

    async new(){
        const param = this.request.getParameters();
        const createdUser = await User.create(param.body.username, param.body.email, param.body.password);

        await this.response.setResponse({message: "User created successfully!", payload: createdUser, redirect: `user/${createdUser.getId()}`, title: createdUser.username});
        
        return this.response;
    }

    async list(){
        const foundUser = await User.findAll();
        await this.response.setResponse({message: "Users retrieved successfully!", statusCode: 200, payload: foundUser});
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
        if(foundUser.deletedAt)
            isDeleted = true;

        await this.response.setResponse({message: "User retrieved successfully!", statusCode: 200, payload: foundUser, title: foundUser.username, template: "User/ShowView", isDeleted: isDeleted, header: this.header});
        return this.response;
    }

    async getEditForm(){
        const param = this.request.getParameters();
        const user = await User.findById(parseInt(param.header[0]));
        
        await this.response.setResponse({message: `Edit ${user.getUsername()} user`, statusCode: 200, payload: user, title: "Edit Form", template: "User/EditFormView"});

        return this.response;
    }

    async getRegisterForm(){
        await this.response.setResponse({message: "Register", statusCode: 200, payload: {}, title: "NewForm", template: "User/NewFormView", isLoggedIn: false})
        return this.response;
    }

    async getLoginForm(){
        const cookies = this.request.getCookies();
        
        let email = '';
        let isRemembered = false;
        if(cookies.remember_email)
        {
            email = cookies.remember_email;
            isRemembered = true;
        }

        await this.response.setResponse({message: "User Login", statusCode:200, payload: {}, title: "LoginForm", template: "LoginFormView", email: email, isRemembered: isRemembered})
        return this.response;
    }


    async logIn(){
        const param = this.request.getParameters();
        try {
            const loggedInUser = await User.logIn(param.body.email, param.body.password);
            
            if(!loggedInUser)
                throw new AuthException("Cannot log in: Invalid credentials.");

            if(loggedInUser.deletedAt)
                throw new AuthException("Cannot log in: User has been deleted.");

            
            this.session.set('user_id', loggedInUser.id)
            if(param.body.remember == 'on')
            {
                const rememberCookie = new Cookie('remember_email', param.body.email);
                this.response.addCookie(rememberCookie);
            }
            
            await this.response.setResponse({message: "Logged in successfully!", payload: loggedInUser, title: "Logged in", redirect: `user/${loggedInUser.id}`, isLoggedIn: true});
            return this.response;
        } catch (error) {
            //const theErr = error.message;

            // if(theErr.includes("Wrong"))
            //     throw new AuthException("Cannot log in: Invalid credentials.");

            throw new AuthException(error.message);
        }
    }

    async logOut(){
        this.session.destroy();
        await this.response.setResponse({message: "Logged out successfully!", payload:{}, redirect:"", isLoggedIn: false})
        return this.response;
    }



    async edit(){
        const param = this.request.getParameters();
        let userToUpdate = await User.findById(param.header[0]);
        
        if(userToUpdate == null)
            throw new UserException(`Cannot update User: User does not exist with ID ${param.header[0]}.`);
        
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
        let userToDelete = await User.findById(param.header[0]);
    
        if(userToDelete == null)
            throw new UserException(`Cannot delete User: User does not exist with ID ${param.header[0]}.`);
        
         
        await userToDelete.remove();
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
            throw new AuthException(error.message, error.statusCode);
        }
        
    }

    async error(){
        await this.response.setResponse({message: "Invalid request method!", statusCode: 405, payload: {} })
        return this.response;
    }
}

module.exports = AuthController;