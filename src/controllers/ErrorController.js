const Controller = require('./Controller');

class ErrorController extends Controller {

    constructor(request, response, session){
        super(request, response, session);

        this.action = this.error;
        

    }

    getAction(){
        return this.action;
    }

    setAction(action){
        this.action = action;
    }

    async doAction(){
        return await this.action();
    }

    async error(){
        await this.response.setResponse({message: "Invalid request path!", statusCode: 404, payload: {}, template: "ErrorView", title: "Error"});
        return this.response;
    }
}

module.exports = ErrorController;
