/**
 * @file Certificates manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.certificatesManager = {}

/**
 * @name getCertUrl
 * @function
 * @param {string}  urlTested              - URL to check
 * @param {boolean} [httpHeadMethod=false] - Use HTTP HEAD method
 * Get the certificate of an URL.
 */
CMH.certificatesManager.getCertUrl = async (urlTested, httpHeadMethod=false) => {
  let response      = null
  let response_data = null

  try {
    if (httpHeadMethod) {
      fetchInit = { method: 'HEAD' }
    } else {
      fetchInit = {}
    }
    response = await fetch(urlTested, fetchInit)

    const contentType = response.headers.get('content-type')
    if(contentType && contentType.includes('application/json')) {
      response_data = await response.json()
    } else {
      response_data = await response.text()
    }
    
  } catch (e) {
    // console.error(e)
  }

  return { data: response_data, response: response }
}