"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Mail, User, Lock } from "lucide-react";
import { registerUser } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(name, email, password, emergencyContactName, emergencyContactPhone, relationship);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#E7F2F7]">
      <Container className="flex flex-col items-center justify-center w-full">
        <Card className="w-full md:w-5/12 max-w-2xl p-8 md:p-10 rounded-3xl shadow-2xl border border-[#D1E1F7] bg-[#ffffff] backdrop-blur-lg mt-20">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#297194] mb-1 tracking-tight">
              Sign Up
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Create your account to start your journey with Aura.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="name"
                    className="block text-base font-semibold mb-1"
                  >
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className="pl-12 py-2 text-base rounded-xl bg-[#ffffff] bg-opacity-80 border border-[#D1E1F7] focus:outline-none focus:border-[#297194] focus:ring-1 focus:ring-[#297194] text-foreground placeholder:text-muted-foreground"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="email"
                    className="block text-base font-semibold mb-1"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-12 py-2 text-base rounded-xl bg-[#ffffff] bg-opacity-80 border border-[#D1E1F7] focus:outline-none focus:border-[#297194] focus:ring-1 focus:ring-[#297194] text-foreground placeholder:text-muted-foreground"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-semibold mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-12 py-2 text-base rounded-xl bg-[#ffffff] bg-opacity-80 border border-[#D1E1F7] focus:outline-none focus:border-[#297194] focus:ring-1 focus:ring-[#297194] text-foreground placeholder:text-muted-foreground"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-base font-semibold mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-12 py-2 text-base rounded-xl bg-[#ffffff] bg-opacity-80 border border-[#D1E1F7] focus:outline-none focus:border-[#297194] focus:ring-1 focus:ring-[#297194] text-foreground placeholder:text-muted-foreground"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-[#D1E1F7] pt-4 mt-4">
                <h3 className="text-lg font-bold mb-3">Emergency Contact <span className="text-sm font-normal text-muted-foreground">(Optional but recommended)</span></h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Contact Name</label>
                    <Input
                      type="text"
                      placeholder="Parent / Guardian name"
                      className="py-2 text-sm rounded-xl bg-[#ffffff] bg-opacity-80 border border-[#D1E1F7] focus:outline-none focus:border-[#297194] focus:ring-1 focus:ring-[#297194] text-foreground"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4 flex-col md:flex-row">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-1">Phone Number <span className="text-xs text-muted-foreground">(e.g. Indian mobile)</span></label>
                      <Input
                        type="tel"
                        placeholder="9XXXXXXXXX"
                        className="py-2 text-sm rounded-xl bg-[#ffffff] bg-opacity-80 border border-[#D1E1F7] focus:outline-none focus:border-[#297194] focus:ring-1 focus:ring-[#297194] text-foreground"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 md:w-1/3">
                      <label className="block text-sm font-semibold mb-1">Relationship</label>
                      <select 
                        className="w-full h-[42px] px-3 text-sm rounded-xl bg-[#ffffff] border border-[#D1E1F7] focus:outline-none focus:border-[#297194] focus:ring-1 focus:ring-[#297194] text-foreground"
                        value={relationship} 
                        onChange={(e) => setRelationship(e.target.value)}
                      >
                        <option value="parent">Parent</option>
                        <option value="guardian">Guardian</option>
                        <option value="sibling">Sibling</option>
                        <option value="friend">Friend</option>
                        <option value="spouse">Spouse</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-base text-center font-medium">
                {error}
              </p>
            )}
            <Button
              className="w-full py-2 text-base rounded-xl font-bold bg-[#297194] text-[#ffffff] shadow-md hover:bg-[#1e5870]"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <div className="my-6 border-t border-[#D1E1F7]" />
          <p className="text-base text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#297194] font-semibold underline hover:text-[#1e5870] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </Container>
    </div>
  );
}
