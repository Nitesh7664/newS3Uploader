import React, {useMemo} from 'react';
import Dropzone, {useDropzone} from 'react-dropzone';
import PropTypes from 'prop-types'

import styles from './MyDropzone.module.css'

const baseStyle = {
   flex: 1,
   display: 'flex',
   flexDirection: 'column',
   alignItems: 'center',
   justifyContent: 'flex-start',
   padding: '20px',
   height: 'fit-content',
   margin: '6em 4em',
   borderWidth: 4,
   borderRadius: 2,
   borderColor: '#eeeeee',
   borderStyle: 'dashed',
   backgroundColor: '#fafafa',
   color: '#bdbdbd',
   outline: 'none',
   transition: 'border .24s ease-in-out',
   fontSize: '1em',
   fontWeight: 'bold',
   overflow: 'hidden'
 };
 
 const activeStyle = {
   borderColor: '#2196f3'
 };
 
 const acceptStyle = {
   borderColor: '#00e676'
 };
 
 const rejectStyle = {
   borderColor: '#ff1744'
 };

function MyDropzone(props) {
  const {open, isDragActive, isDragAccept, isDragReject} = useDropzone({
    // Disable click and keydown behavior
    noClick: false,
    noKeyboard: false
  });
  const style = useMemo(() => ({
   ...baseStyle,
   ...(isDragActive ? activeStyle : {}),
   ...(isDragAccept ? acceptStyle : {}),
   ...(isDragReject ? rejectStyle : {})
 }), [
   isDragActive,
   isDragReject,
   isDragAccept
 ]);

   return (
      <>
      <Dropzone onDrop={props.onDrop} className="dropzone" accept="image/*, application/pdf" onClick={false} >
      {({getRootProps, getInputProps, acceptedFiles, fileRejections}) => (
         <div {...getRootProps({style})}>
            <input {...getInputProps()} />
            <p className={styles.large_text}>Drag 'n' drop some files here</p>
            <button type="button" onClick={open} className={`${styles.button}`}>
            Select Image/Pdf
            </button>
            <br />
            <h1>{acceptedFiles.length > 0? "Selected Files:": null}</h1>
            <ul>{props.selectedFiles.map(file => (
                  <li key={file.path}>
                     {file.path} - {file.size} bytes
                  </li>
               ))}
            </ul>  
            <br />
            <h1>{fileRejections.length > 0? "Rejected Files:": null}</h1>
            <ul>{fileRejections.map(file => (
                  <li key={file.path}>
                     {file.path} - {file.size} bytes
                  </li>
               ))}
            </ul>
            {props.children}
         </div>
      )}
      </Dropzone>
      </>
   );
}

MyDropzone.propTypes = {
   onDrop: PropTypes.func.isRequired,
   selectedFiles: PropTypes.array.isRequired
}

export default MyDropzone