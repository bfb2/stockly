import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects(){
    return [
      {
        source:'/',
        destination:'/backtrace-portfolio',
        permanent:true
      }
    ]
  }
};

export default nextConfig;
