declare type actionEvent = {event: string, value: string, master?: boolean}
declare type chatCallBack = (msg:{color:number, user:string,text:string}[]) => void;
