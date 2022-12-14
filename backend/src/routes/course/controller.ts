import config from 'config';
import { Request , Response } from 'express' ;
import { unlink } from 'fs';
import _ from 'lodash'
import { ICourse, IFile } from '../../lib/interfaces';
import response from '../../utils/response';
import service from './service';


export async function getAllCourse(req:Request , res:Response) {
    const courses = await service.getAllCourse();
    response(res , {
        data : courses,
    })
}


export async function getById(req:Request , res:Response) {
    let id = parseInt(req.params.id) ;
    
    let found = await service.getCourseById(id) ;

    if(!found){
        return response(res , {
            message : 'not found' ,
            status : 404
        })
    }

    response(res, {
        data : found
    })
}


export async function createCourse(req:Request , res:Response) {
    let {
        name , 
        description , 
        discount , 
        price , 
        title , 
        avatar , 
        level 
    } = req.body ;
        
    let data:ICourse = {
        name ,
        description , 
        discount ,
        price , 
        title , 
        avatar ,
        level ,
        teacherId : req.user.id
    }

    
    if(req.file){
        const filePath = req.file.path.replace(/\\/g,'/').substring(6);
        data.filePath = filePath ; 
        data.avatar = `${config.get('host')}/${filePath}`;
    }

    const newCourse = await service.createCourse(data)

    response(res, {
        message : 'successfully created' ,
        status : 201 , 
        data : newCourse
    })
}

export async function updateCourse(req:Request , res:Response) {
    let id = parseInt(req.params.id) ;

    const found = await service.getCourseById(id) ;

    if(!found){
        return response(res , {
            message : 'course is not found' ,
            status : 404
        })
    }

    let {
        name , 
        description , 
        discount , 
        price , 
        title , 
        avatar , 
        level 
    } = req.body ;
    
    
    let data:ICourse = {
        name ,
        description , 
        discount ,
        price , 
        title , 
        level ,
        avatar ,
        teacherId : req.user.id
    }

    if(req.file){
        const filePath = req.file.path.replace(/\\/g,'/').substring(6);
        data.filePath = filePath ;
        data.avatar = `${config.get('host')}${filePath}`

        let previousFilePath = `${process.cwd()}/public/${found.filePath}`
        unlink(previousFilePath , (err)=>{
            console.error(err)
        })
    }

    const result =  await service.updateCourse(id , data) ;

    response(res , {
        message : 'successFully updated' , 
        data : result ,
    })
}


export async function deleteCourse(req:Request , res:Response) {
    let id = parseInt(req.params.id) ;

    service.deleteCourse(id)
    .then(()=>{
        response(res , {
            message : 'successfully deleted' , 
        })
    })
    .catch(()=>{
        response(res, {
            message : "the course is not found"
        })
    })
}

export async function addFileToCourse(req:Request , res:Response) {
    let id = parseInt(req.params.id) ;

    const course = await service.getCourseById(id);

    if(!course){
        return response(res , {
            message : 'course is not found' ,
            status : 404
        })
    }
    
    let { title , file } = req.body ;
    
    if(!req.file){
        return response(res , {
            message : 'file is required' , 
            status : 400
        })
    }

    const filePath = req.file.path.replace(/\\/g,'/').substring(6) ; 
    file = `${config.get('host')}/${filePath}`;
    
    let data:IFile = {
        title : title ,  
        courseId : course.id ,
        size : req.file.size ,
        filePath ,
        file , 
    }

    const newFile = await service.addFileToCourse(data)

    response(res, {
        message : 'successfuly uploaded' ,
        data : newFile ,
    })
}

export async function deleteFileToCourse(req:Request , res:Response) {
    let id = parseInt(req.params.id) ;

    const found = await service.getFilesById(id);

    if(!found){
        return response(res,{
            message : 'file is not found' ,
            status : 400
        })
    }

    const filePath = `${process.cwd()}/public/${found.filePath}`
    unlink(filePath , (err)=>{
        console.error(err)
    })

    service.deleteFileToCourse(id)
    .then(()=>{
        response(res, {
            message : 'successfully deleted' , 
        })
    })


}