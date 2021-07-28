class Controller {
    constructor(request, response, session){
        this.request = request;;
        this.response = response;
        this.session = session;
    }

    setAction(){

    }

    getAction(){

    }

    doAction(){

    }

    error(){
        return this.response;
    }
}

module.exports = Controller;
