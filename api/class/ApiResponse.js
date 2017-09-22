/**
 * All JSON responses are instances of this class
 */
class ApiResponse {
  /**
   * requested: send back the client requested route,
   * success  : indicate to the client if the request was a success,
   * errors   : a list of errors if the client request failed,
   * data     : the requested data,
   * timestamp: timestamp when the response is sent
   * @param {{req: Request, success: boolean, errors: [], data: any, time: string}} props 
   */
  constructor(props = {}) {
    this.requested = props['req'] ? `${props['req']['method']} ${props['req']['url']}` : '';
    this.success = props['success'] || false;
    this.errors = props['errors'] || [];
    this.data = props['data'] || null;
    this.timestamp = (Date.now()).toString();
    this.status = props['status'] || 200;
  }
}

module.exports = ApiResponse;