export type CreatedFamily={family:{id:string;name:string};products:Array<{id:string;colorId:string;slug:string;title:string}>};
export type StagedColorway={colorId:string;colorName:string;files:File[]};
export type FailedUpload={productId:string;colorId:string;colorName:string;file:File;position:number};
export async function uploadColorwayMedia(created:CreatedFamily,staged:StagedColorway[],upload:(productId:string,file:File,position:number)=>Promise<unknown>,progress?:(message:string)=>void,only?:FailedUpload[]):Promise<FailedUpload[]>{
 const productByColor=new Map(created.products.map(product=>[product.colorId,product]));
 const tasks=only??staged.flatMap(colorway=>colorway.files.map((file,position)=>({productId:productByColor.get(colorway.colorId)?.id??'',colorId:colorway.colorId,colorName:colorway.colorName,file,position})));
 const failures:FailedUpload[]=[];const totals=new Map<string,number>();for(const task of tasks)totals.set(task.colorId,(totals.get(task.colorId)??0)+1);const completed=new Map<string,number>();
 for(const task of tasks){if(!task.productId){failures.push(task);continue}progress?.(`Uploading ${task.colorName} images ${(completed.get(task.colorId)??0)+1} / ${totals.get(task.colorId)}`);try{await upload(task.productId,task.file,task.position);completed.set(task.colorId,(completed.get(task.colorId)??0)+1)}catch{failures.push(task)}}return failures;
}
