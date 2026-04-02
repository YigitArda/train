/**
 * Connector contract (documented shape)
 *
 * {
 *   id: string,
 *   lastKnownData?: any,
 *   redirectUrl?: string,
 *   smokeSelectors?: string[],
 *   fetchHttp(ctx): Promise<{ html: string, data?: any }>,
 *   fetchBrowser(ctx): Promise<{ html: string, data?: any }>,
 *   parse(ctx, html): Promise<any>
 * }
 */

module.exports = {};
