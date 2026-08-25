import { Eye, Lock, Mail } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getAccessToken, login } from "../data/api";
import { AuthLayout } from "./auth/AuthLayout";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("jessica.brown@gmail.com");
  const [password, setPassword] = useState("Password123!");
  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/profile");
    }
  });

  if (getAccessToken()) return <Navigate to="/profile" replace />;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthLayout title="Your Beauty, Our Priority" mode="login">
      <h1 className="text-3xl font-black">Welcome Back!</h1>
      <p className="mt-2 text-muted">Login to continue to your account</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block"><span className="form-label">Email Address</span><div className="input-wrap"><Mail /><input placeholder="Enter your email address" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div></label>
        <label className="block"><span className="form-label">Password <Link className="float-right text-brand-500" to="/login">Forgot Password?</Link></span><div className="input-wrap"><Lock /><input type="password" placeholder="Enter your password" required value={password} onChange={(event) => setPassword(event.target.value)} /><Eye /></div></label>
        <label className="flex gap-2 text-sm"><input type="checkbox" defaultChecked /> Remember me</label>
        <button className="btn-primary w-full py-4" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Logging in..." : "Login"}</button>
        {mutation.isError ? <p className="font-bold text-brand-500">Invalid email or password.</p> : null}
      </form>
      <SocialButtons />
      <p className="mt-8 text-center">Don't have an account? <Link className="font-bold text-brand-500" to="/signup">Sign Up</Link></p>
    </AuthLayout>
  );
}

export function SocialButtons() {
  return <div className="mt-8 space-y-3"><p className="text-center text-sm text-muted">or continue with</p>{["Google", "Facebook", "Apple"].map((x) => <button className="btn-outline w-full py-3" key={x}>Continue with {x}</button>)}</div>;
}
