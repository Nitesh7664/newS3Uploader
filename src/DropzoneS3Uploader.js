import React from 'react';
import PropTypes from 'prop-types'
import Evaporate from 'evaporate';

import MyDropzone from './MyDropzone';
// import { HmacSHA256 } from 'crypto-js';
import sha256 from 'js-sha256';

export default class DropzoneS3Uploader extends React.Component {

  static propTypes = {
    isImage: PropTypes.func.isRequired,
    passChildrenProps: PropTypes.bool,
    uploadOnDrop: PropTypes.bool,

    imageComponent: PropTypes.func,
    fileComponent: PropTypes.func,
    progressComponent: PropTypes.func,
    errorComponent: PropTypes.func,

    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ]),

    onDrop: PropTypes.func,
    onError: PropTypes.func,
    onProgress: PropTypes.func,
    onFinish: PropTypes.func,

    // Passed to react-s3-uploader
    upload: PropTypes.object.isRequired,

    // Default styles for react-dropzone
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ])
  }

  static defaultProps = {
    upload: {},
    className: 'react-dropzone-s3-uploader',
    passChildrenProps: true,
    uploadOnDrop: true,
    isImage: filename => filename && filename.match(/\.(jpeg|jpg|gif|png|svg)/i),
  }

  constructor(props) {
    super(props)
    const uploadedFiles = [];
    let assignmentId = new URLSearchParams(this.props.location.search).get(
        "assignmentId"
      );
    this.state = {
      uploadedFiles: uploadedFiles,
      selectedFiles: [],
      assignmentId: assignmentId,
      activeUpload: null
    };
  }

  componentWillMount = () => {
    this.setUploaderOptions(this.props);
    this._mounted = true;
  }

  componentWillUnmount = () => {
    this._mounted = false;
  }

  componentWillReceiveProps = props => this.setUploaderOptions(props)


  setUploaderOptions = () => {
    this.setState({
      uploaderOptions: {
        evaporateOptions: {
            aws_key: "AWS_KEY",
            bucket: "AWS_BUCKET"
         },     
        signingUrl: "http://localhost:7001/signing-url",
        contentDisposition: 'auto',
        uploadRequestHeaders: {'x-amz-acl': 'public-read'},
        onFinishS3Put: this.handleFinish,
        onProgress: this.handleProgress,
        onError: this.handleError
      }
    });
  }

  handleProgress = (progress, textState, file, stats) => {
    this.props.onProgress && this.props.onProgress(progress, textState, file, stats);
    
    if(this._mounted){
      this.setState({progress});
    }
  }

  handleError = err => {
    this.props.onError && this.props.onError(err);
    if(this._mounted){
      this.setState({error: err, progress: null, activeUpload: null,
                     activeUploadOptions: null});
    }
  }

  handleFinish = (info, file) => {
    console.log("handleFinish called")
    const uploadedFile = Object.assign({
      file,
      fileUrl: this.fileUrl(this.props.s3Url, info.filename)
    }, info);

    const uploadedFiles = this.state.uploadedFiles;
    uploadedFiles.push(uploadedFile);

    if(this._mounted){
      this.setState(
        {uploadedFiles, error: null, progress: null, selectedFiles: [],
         activeUpload: null, activeUploadOptions: null},
        () => {
          this.props.onFinish && this.props.onFinish(uploadedFile);
        }
      );
    } else {
      // Even if the component isn't mounted anymore we want to call the
      // callback onFinish method even if we're not modifying the component's
      // internal state.
      this.props.onFinish && this.props.onFinish(uploadedFile);
    }
  }

  handleDrop = (files, rejectedFiles) => {
      console.log("handleDrop called")
    const options = {
      files,
      ...this.state.uploaderOptions
    };
    const newState = {
        ...this.state,
      uploadedFiles: [],
      error: null,
      progress: null,
      selectedFiles: files
    };
    this.setState(newState);
    this.startFileUpload(options, newState);
  }
  
  startFileUpload = (files=null, state=null) => {
      console.log("startFile Upload Called")
    const options = {
      files: files !== null ? files: this.state.selectedFiles,
      ...this.state.uploaderOptions
    };
    
    // console.log(options)
    // let reactObj = new ReactS3Uploader()
    // console.log(reactObj)
    // let S3UploadObj = (new S3Upload(options))
    // console.log(S3UploadObj)

    // this.setState({
    //   ...this.state,
    //   ...state,
    //   activeUploadOptions: options,
    //   activeUpload: new S3Upload(options)
    // });
    this.state.selectedFiles.forEach(file => this.uploadToS3(file))
    
  }
  
  signResponseHandler = (res, op1, op2) => {
    debugger
    return new Promise( (resolve, reject) => {
      debugger
      resolve(res.substring(3, res.length - 1));
    })
  }

  uploadToS3 = (file) => {
      console.log("uploadToS3 called")
    var evaporateOptions = {
        signerUrl: "http://localhost:3000/api/auth/signer",
        signResponseHandler:this.signResponseHandler,
        aws_key: "AKIAI7XG2KFOFTJ3ZMGA",
        bucket: "edureact-dev",
        aws_url: 'https://s3.amazonaws.com/edureact-dev',
        cloudfront: true,
        computeContentMd5: true,
        cryptoMd5Method: data => Crypto
        .createHash('md5')
        .update(data)
        .digest('base64'),
        cryptoHexEncodedHash256: sha256
    };
    return Evaporate.create(evaporateOptions)
    .then(function(evaporate){
      var addConfig = {
        name: file.name,
        file: file,
        progress: function(progressValue, stats){
          return this.handleProgress(progressValue, progressValue === 100 ? 'Finalizing' : 'Uploading', file, stats);
        }.bind(this),
        complete: function(_xhr, awsKey){
          if (_xhr.status === 200) {
            this.handleProgress(100, 'Upload completed', file);
          } else {
            return this.handleError('Upload error: ' + _xhr.status, file);
          }
        }.bind(this),
        error: function(msg){
          return this.handleError(msg, file);
        }.bind(this)
      };
      this.evaporate = evaporate;
      evaporate.add(addConfig).then(
        function(awsKey){
          return this.handleFinish(awsKey, file);
        }.bind(this),
        function(errorReason){
          return this.handleError(errorReason, file);
        }.bind(this)
      );
    }.bind(this));
};
  

  abortUpload = (filenames=null) => {
    if (!this.state.activeUpload){
      return;
    }
    if (filenames){
      for (let i=0; i < filenames.length; i++) {
        this.state.activeUpload.abortUpload(filenames[i]);
      }
    } else {
      this.state.activeUpload.abortUpload();
    }
  }

  renderImage = ({uploadedFile}) => (<div className="rdsu-image"><img src={uploadedFile.fileUrl} alt={uploadedFile.file.name}/></div>)

  renderFile = ({uploadedFile}) => (
    <div className="rdsu-file">
      <div className="rdsu-file-icon"><span className="fa fa-file-o" style={{fontSize: '50px'}} /></div>
      <div className="rdsu-filename">{uploadedFile.file.name}</div>
    </div>
  )

  renderProgress = ({progress}) => (progress ? (<div className="rdsu-progress">{progress}</div>) : null)

  renderError = ({error}) => (error ? (<div className="rdsu-error small">{error}</div>) : null)

  render() {
    const {
      imageComponent,
      fileComponent,
      progressComponent,
      errorComponent
    } = this.props

    const ImageComponent = imageComponent || this.renderImage
    const FileComponent = fileComponent || this.renderFile
    const ProgressComponent = progressComponent || this.renderProgress
    const ErrorComponent = errorComponent || this.renderError

    const {uploadedFiles} = this.state
    const childProps = {...this.state}

    let content = null
    content = (
        <div>
            {uploadedFiles.map(uploadedFile => {
            const props = {
                key: uploadedFile.filename,
                uploadedFile: uploadedFile,
                ...childProps
            }
            return this.props.isImage(uploadedFile.fileUrl) ?
                (<ImageComponent  {...props} />) :
                (<FileComponent {...props} />)
            })}
            <ProgressComponent {...childProps} />
            <ErrorComponent {...childProps} />
        </div>
    )

    return (
        <MyDropzone onDrop={this.handleDrop} selectedFiles={this.state.selectedFiles}>
            {content}
        </MyDropzone>
    )
  }
}