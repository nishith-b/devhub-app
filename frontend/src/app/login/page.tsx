"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useAppData, user_service } from "@/context/AppContext";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";

const LoginPage = () => {
  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuth) {
      router.push("/blogs");
    }
  }, [isAuth, router]);

  // Handle successful Google login
  const responseGoogle = async (authResult: { code?: string }) => {
    if (!authResult.code) {
      toast.error("No authorization code received from Google");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(`${user_service}/api/v1/login`, {
        code: authResult.code,
      });

      Cookies.set("token", result.data.token, {
        expires: 5,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      toast.success(result.data.message);
      setIsAuth(true);
      setUser(result.data.user);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Problem while logging you in");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login errors
  const handleGoogleLoginError = (error: unknown) => {
    console.error("Google login error:", error);
    toast.error("Google login failed");
    setLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: handleGoogleLoginError,
    flow: "auth-code",
  });

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-[350px] m-auto mt-[200px]">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Login to The Reading Retreat</CardTitle>
              <CardDescription>Your go to blog app</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => googleLogin()}>
                Login with Google{" "}
                <img
                  src={"/google.png"}
                  className="w-6 h-6 inline-block ml-2"
                  alt="google icon"
                />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LoginPage;
