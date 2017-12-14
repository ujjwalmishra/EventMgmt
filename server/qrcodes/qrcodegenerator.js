import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import nacl from 'tweetnacl';
import qr from 'qr-image';

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

function generateQR(keys) {

  let svgPaths = [];

  for(let i=0; i < keys.length; i++) {
  
    let svjObj = qr.svgObject('keys.secretKey');
    svgPaths.push(svjObj);
  
  }

  return svgPaths;

}



 export default { generateTickets, generateQR};