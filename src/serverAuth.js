// router.get('/signer', async (req, res, next) => {
//     try {
//       const { datetime, to_sign } = req.query
  
//       const encodedToSign = to_sign.toString('utf8')
//       const stringToSign = base64.encode(encodedToSign)
  
//       // const signature = cryptography
//       //   .createHmac('sha256', process.env.AWS_KEY)
//       //   .update(to_sign, 'utf8')
//       //   .digest('base64')
  
//       const key = process.env.AWS_KEY
//       const dateStamp = datetime
//       const regionName = process.env.REGION
//       const serviceName = 'iam'
  
//       const kDate = crypto.HmacSHA256(dateStamp, `AWS4${key}`)
//       const kRegion = crypto.HmacSHA256(regionName, kDate)
//       const kService = crypto.HmacSHA256(serviceName, kRegion)
//       const kSigning = crypto.HmacSHA256('aws4_request', kService)
  
//       const signature = crypto
//         .createHash('sha1')
//         .update(encodedToSign)
//         .digest('base64')
  
//       // const signature = base64.b64encode(
//       //   hmac.new(process.env.AWS_KEY, encodedToSign, hashlib.sha1).digest())
//       res.set('Content-Type', 'text/HTML')
//       res.json(signature)
  
//       // # TODO: Do something to authenticate this request
//       //     to_sign = str(self.request.get('to_sign')).encode('utf-8')
//       //     signature = base64.b64encode(
//       //         hmac.new(b'YOUR_AWS_SECRET_KEY', to_sign, hashlib.sha1).digest())
//       //     self.response.headers['Content-Type'] = "text/HTML"
//       //     self.response.out.write(signature)
//     } catch (e) {
//       res.status(401).json({ error: e.message })
//     }
//   })