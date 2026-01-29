class ApiResponse {
    constructor(stausCode,data,message="success"){
        this.stausCode=stausCode,
        this.data=data
        this.message=message
        this.success=statusCode<400
    }
}

export {ApiResponse}