/** Global definitions for developement **/

// for style loader
declare module '*.css' {
  const styles: { [className: string]: string };
  export default styles;
}

// Express.Request.user is declared in types/express-user.d.ts

declare module "serve-favicon" {
    import { RequestHandler } from "express";
    function favicon(path: string, options?: { maxAge?: number }): RequestHandler;
    export = favicon;
}
