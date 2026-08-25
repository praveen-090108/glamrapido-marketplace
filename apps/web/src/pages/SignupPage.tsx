import { Eye, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getAccessToken, signup } from "../data/api";
import { SocialButtons } from "./LoginPage";
import { AuthLayout } from "./auth/AuthLayout";

export function SignupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const mutation = useMutation({
    mutationFn: () => signup({ name, email, phone, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/profile");
    }
  });

  if (getAccessToken()) return <Navigate to="/profile" replace />;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    mutation.mutate();
  }

  return (
    <AuthLayout title="Start Your Beauty Journey With Us" mode="signup">
      <h1 className="text-3xl font-black">Create Your Account</h1>
      <p className="mt-2 text-muted">Sign up to get started</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block"><span className="form-label">Full Name</span><div className="input-wrap"><UserRound /><input placeholder="Enter your full name" required value={name} onChange={(event) => setName(event.target.value)} /></div></label>
        <label className="block"><span className="form-label">Email Address</span><div className="input-wrap"><Mail /><input placeholder="Enter your email address" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div></label>
        <label className="block"><span className="form-label">Phone Number</span><div className="input-wrap"><Phone /><input placeholder="+1 212 555 9876" value={phone} onChange={(event) => setPhone(event.target.value)} /></div></label>
        <label className="block"><span className="form-label">Password</span><div className="input-wrap"><Lock /><input type="password" placeholder="Create a password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /><Eye /></div></label>
        <label className="block"><span className="form-label">Confirm Password</span><div className="input-wrap"><Lock /><input type="password" placeholder="Confirm your password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><Eye /></div></label>
        <label className="flex gap-2 text-sm"><input type="checkbox" defaultChecked /> I agree to the <span className="text-brand-500">Terms & Conditions</span></label>
        <button className="btn-primary w-full py-4" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Sign Up"}</button>
        {formError ? <p className="font-bold text-brand-500">{formError}</p> : null}
        {mutation.isError ? <p className="font-bold text-brand-500">Unable to create account. Check details or use another email.</p> : null}
      </form>
      <SocialButtons />
      <p className="mt-8 text-center">Already have an account? <Link className="font-bold text-brand-500" to="/login">Login</Link></p>
    </AuthLayout>
  );
}
