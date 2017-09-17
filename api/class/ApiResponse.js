/**
 * api response format or interface (Now now, this a class not interface)
 */
class ApiResponse {
  /**
   * 
   * @param {{req: Request, success: boolean, errors: [], data: any, time: string}} props 
   */
  constructor(props = {}) {
    this.requested = props['req'] ? `${props['req']['method']} ${props['req']['url']} ${props['req']['originalUrl']}` : '';
    this.success = props['success'] || false;
    this.errors = props['errors'] || [];
    this.data = props['data'] || null;
    this.timestamp = (Date.now()).toString();
  }
}

module.exports = ApiResponse;