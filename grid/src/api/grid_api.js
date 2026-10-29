const API = import.meta.env.VITE_API

export async function getBattlers(){
    try{
        const response = await fetch(API+'/battlers');
        const result = await response.json();
        return result;
    }catch(err){
        console.log(err)
    }
}

export async function getBattlersById(id){
    try{
        const response = await fetch(API+'/battlers'+id);
        const result = await response.json();
        return result;
    }catch(err){
        console.log(err)
    }
}

export async function generateGrid(){
    try{
        const response = await fetch(API+'/grid');
        const result = await response.json();
        return result;
    }catch(err){
        console.log(err)
    }
}

//get saved grid

export async function submitGuesss(battlerId,rowCategoryId, colCategoryId ){
    const payload = {"battlerId": battlerId, "rowCategoryId":rowCategoryId,"colCategoryId":colCategoryId }
    try{
        const response = await fetch(API+"/grid", {
            method:"POST",
            headers: {
                "Content-Type":"application/json",
                },
            body:JSON.stringify(payload)
            })
        const result = await response.json();
        return result;
    }catch(error){
        console.log(error)
        return {}
    }
}

//