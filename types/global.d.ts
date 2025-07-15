/** Global definitions for developement **/

// for style loader
declare module '*.css' {
  const styles: any;
  export = styles;
}

declare namespace Express {
  interface Request {
    user?: { // Or your specific User type
      userID: number; // Or number, depending on your userID type
      // Other user properties if applicable
    };
  }
}

declare module "serve-favicon" {
    import { RequestHandler } from "express";
    function favicon(path: string, options?: { maxAge?: number }): RequestHandler;
    export = favicon;
}
