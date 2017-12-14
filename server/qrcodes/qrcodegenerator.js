import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import nacl from 'tweetnacl';
import qr from 'qr-image';
import fs from 'fs';
import resizeImg from 'resize-img';
import fileType from 'file-type';

function generateTickets(qty) {

  let keysArray = [];
  
  for(let i=0; i < qty; i++) {
    let keys = nacl.box.keyPair();
    let stringifyKeys = {
      publicKey: keys.publicKey.toString(),
      secretKey: keys.secretKey.toString()
    }

    keysArray.push(stringifyKeys);
  }

  return keysArray;

}

function generateQR(keys, eventId) {

  let pngPaths = [];

  for(let i=0; i < keys.length; i++) {
    
    let qr_png = qr.image(keys[i].secretKey, { type: 'png', size: 2, margin: 2 });
    let pngImagePath = "Event-" + eventId + "-" + i + ".png"; 

    qr_png.pipe(fs.createWriteStream("public/codes/" +pngImagePath ));

    pngPaths.push(pngImagePath);
  
  }


  return pngPaths;

}

function retrieveQr(eventId, QrCount) {
    const resizeCodes = resizeQr(eventId, QrCount);
    if(resizeCodes.msg) {
      console.log("nkokll");
      console.log(resizeCodes);
      return {data: resizeCodes.paths};
    }
    else {
      return {"msg": "failed"};
    }
}

function resizeQr(eventId, length) {

  let status = true;
  let qrPaths = [];
  console.log(length);
  for(let i=0; i < length; i++) {
    console.log("doing job");
    let pngImagePath = "Event-" + eventId + "-" + i + ".png";     
    qrPaths.push(pngImagePath);
    resizeImg(fs.readFileSync("public/codes/" +pngImagePath), {width: 81, height: 81})
    .then(buf =>  
     {
      fs.writeFileSync("public/codes/" +pngImagePath, buf);
     }
    )
    .catch( (e) => 
      {
        status = false;
      });
  }

  return {"msg": status, "paths": qrPaths};

}



 export default { generateTickets, generateQR, retrieveQr};