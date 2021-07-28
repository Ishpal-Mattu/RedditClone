class Request {
    constructor(requestMethod = 'GET', path = '', bodyParameters = {}, cookies){
        this.controllerName = null;
        this.requestMethod = requestMethod;
        this.parameters = null;
        this.cookies = cookies;

        
        let pathSplit = null;
        if(!path)
            this.controllerName = path;
        else
        {
            pathSplit = path.split('/');
            this.controllerName = pathSplit[1];
            //console.log(pathSplit);
        }
        let theHeader = {};
        if(pathSplit !== null)
        {
            if(!bodyParameters && (pathSplit.length <= 2 || pathSplit === null))
            {
                theHeader = {};
            }
            else if(pathSplit.length <= 2 || pathSplit === null)
            {
                theHeader = [];
            }
            else if(pathSplit.length >= 3)
            {
                theHeader = [];
                for(let i = 2; i<pathSplit.length; i++)
                {
                    theHeader[i-2] = pathSplit[i];
                }
            }
        }
        
        
        this.parameters = {body: bodyParameters, header: theHeader};
        
    }

    /**
     * returns model name.
     */
    // getModelName(){
    //     return this.modelName;
    // }

    getControllerName(){
        return this.controllerName;
    }

    getCookies(){
        return this.cookies;
    }

    getRequestMethod(){
        return this.requestMethod;
    }

    getParameters(){
        return this.parameters;
    }
}

module.exports = Request;
