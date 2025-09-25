  export function  createUsername(username:string):string {

  

    if (username) {
     

    let words = username.split(' ');
    let length = words.filter((element: string)=> element!= "").length

    if (length > 1) {
      return (words[0].charAt(0).toLowerCase() + words[1].toLowerCase());
 
    }else {
      return "";
    }
  }else {
    return ""
  }
  }
