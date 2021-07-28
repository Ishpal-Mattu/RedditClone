const UserController = require('../controllers/UserController');
const CategoryController = require('../controllers/CategoryController');
const PostController = require('../controllers/PostController');
const CommentController = require('../controllers/CommentController');
const HomeController = require('../controllers/HomeController');
const ErrorController = require('../controllers/ErrorController');
const AuthController = require('../controllers/AuthController');

class Router {
    constructor(request, response, session)
    {
        this.request = request;
        this.response = response;
        this.session = session;

        const controllerName = request.getControllerName();

        this.setController(controllerName);
        
    }

    setController(controllerName){
        if(controllerName.toUpperCase() == 'USER'){
            this.controller = new UserController(this.request, this.response, this.session);
        }
        else if(controllerName.toUpperCase() == 'AUTH'){
            this.controller = new AuthController(this.request, this.response, this.session);
        }
        else if(controllerName.toUpperCase() == 'CATEGORY'){
            this.controller = new CategoryController(this.request, this.response, this.session);
        }
        else if(controllerName.toUpperCase() == 'POST'){
            this.controller = new PostController(this.request, this.response, this.session);
        }
        else if(controllerName.toUpperCase() == 'COMMENT'){
            this.controller = new CommentController(this.request, this.response, this.session);
        }
        else if(controllerName.toUpperCase() == ''){
            this.controller = new HomeController(this.request, this.response, this.session);
        }
        else{
            this.controller = new ErrorController(this.request, this.response, this.session);
        }

    }
    getController(){
        return this.controller;
    }

    async dispatch(){
        try {
            const toReturn = await this.controller.doAction();
            this.session.refresh();
            return toReturn;
        } catch (error) {
            await this.response.setResponse({statusCode: error.statusCode, message: error.message, payload: {}, template: "ErrorView", title: "Error", isLoggedIn: this.session.exists('user_id')})
            return this.response;
        }
        
    }
}

module.exports = Router;
