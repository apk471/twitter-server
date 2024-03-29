import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";

interface GoogleTokenResult{
    
        iss?: string;
        azp?: string;
        aud?: string;
        sub?: string;
        email: string;
        email_verified: string;
        nbf?: string;
        name: string;
        picture?: string;
        given_name?: string;
        locale: string;
        iat?: string;
        exp?: string;
        jti?: string;
        alg?: string;
        kid?: string;
        typ?: string;
    
}

const queries = {
    verifyGoogle: async(parent: any , {token}:{token: string}) => {
        const googleToken =  token;
        const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOauthURL.searchParams.set("id_token" , googleToken)

        const {data} = await axios.get<GoogleTokenResult>(googleOauthURL.toString() , {
            responseType: "json"
        })

        const user = await prismaClient.user.findUnique({
            where: {email: data.email},
        });

        if(!user){
            await prismaClient.user.create({
                data:{
                    email: data.email,
                    firstName: data.name,
                    lastName: data.name,
                    profileImageURL: data.picture,

                }
            })
        }
        const userInDb = await prismaClient.user.findUnique({ where: {email: data.email} })

        if(!userInDb) throw new Error("user with email not found");
        const userToken = JWTService.generateTokenForUser(userInDb);
        return userToken;
        
    },
};

export const resolvers = {queries};