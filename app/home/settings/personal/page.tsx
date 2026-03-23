"use client";
import React, { useState } from "react";
import { updateProfile } from "@/lib/profile";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Camera } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import Footer from "@/components/layout/Footer";
import { department } from "@/lib/types";

function PersonalInfoTabContent() {
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    firstName: session?.user.firstName ?? "",
    lastName: session?.user.lastName ?? "",
    middleName: session?.user.middleName ?? "",
    phone: session?.user.phone ?? "",
    position: session?.user.position ?? "",
    department: session?.user.department ?? "",
    employeeId: session?.user.employeeId ?? "",
    birthdate: session?.user.birthdate ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile(formData);
      if (!result) throw new Error("Failed to update user");
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Tabs defaultValue="personal">
      <TabsContent value="personal" className="mt-0 focus-visible:outline-none">
        <Card className="border-border border">
          <CardHeader className="pb-4 flex flex-col gap-1">
            <CardTitle className="text-xl font-bold">
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your avatar and public profile details.
            </CardDescription>
            <Separator />
          </CardHeader>
          <CardContent className="flex flex-col xl:flex-row items-start gap-12 space-y-6">
            {/* PROFILE PHOTO SECTION */}
            <div className="flex flex-row items-center bg-card/50 border border-border p-6 gap-6 rounded-xl w-full xl:w-fit">
              <div className="relative group size-20">
                <div className="size-full rounded-full aspect-square bg-background flex items-center justify-center overflow-hidden shadow-sm">
                  {session?.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="object-cover"
                    />
                  ) : (
                    <User className="size-10 text-muted-foreground" />
                  )}
                </div>
                <button className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                  <Camera className="size-5" />
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Profile Photo</p>
                <p className="text-xs text-neutral-500 max-w-[200px]">
                  Click image to upload a new one. PNG or JPG preferred.
                </p>
              </div>
            </div>

            {/* INFORMATION SECTION */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
              <span className="col-span-2">
                <h1 className="text-lg font-bold">Company Information</h1>
                <Separator className="my-2" />
              </span>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  placeholder="Enter First Name"
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  placeholder="Enter Last Name"
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  value={session?.user.email ?? ""}
                  disabled
                  className="bg-neutral-100"
                  placeholder="Enter Work Email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  placeholder="Enter Employee ID"
                  onChange={handleInputChange}
                  className="bg-neutral-100"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  placeholder="Enter Position"
                  onChange={handleInputChange}
                  disabled
                  className="bg-neutral-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={department[formData.department as keyof typeof department]}
                  placeholder="Enter Department"
                  onChange={handleInputChange}
                  className="bg-neutral-100"
                  disabled
                />
              </div>

              <span className="col-span-2">
                <h1 className="text-lg font-bold">Other Information</h1>
                <Separator className="my-2" />
              </span>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  placeholder="Enter Phone Number"
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthdate}
                  placeholder="Select Birthdate"
                  type="date"
                  onChange={handleInputChange}
                />
              </div>

              <span className="col-span-2 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving || !hasChanges}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <footer>
        <Footer />
      </footer>
    </Tabs>
  );
}

export default PersonalInfoTabContent;