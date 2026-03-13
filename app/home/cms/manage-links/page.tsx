"use client";
import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { FormField } from "@/components/layout/forms/SettingsFormSection";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

function ManageLinks() {
  const [facebookLink, setFacebookLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [tiktokLink, setTiktokLink] = useState("");

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Manage Social Links"
          description="Manage your social links and their visibility."
        />

        <div className="flex flex-col gap-8">
          {/* FORMS */}
          <div className="mt-8 flex flex-col border border-border p-6 rounded-lg">
            {/* FORM HEADER */}
            <div className="flex items-center gap-2">
              <span>
                <Globe className="size-5 text-primary" />
              </span>
              
              <h1 className="text-lg font-medium text-neutral-800">
                Social Media Links Manager
              </h1>
            </div>
            
            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Facebook Link">
                <InputGroup>
                  <InputGroupInput
                    value={facebookLink ?? ""}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    placeholder="https://www.facebook.com/yourpage"
                  />
                  <InputGroupAddon>
                    <FaFacebook />
                  </InputGroupAddon>
                </InputGroup>
              </FormField>

              <FormField label="Instagram Link">
                <InputGroup>
                  <InputGroupInput
                    value={instagramLink ?? ""}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="https://www.instagram.com/yourpage"
                  />
                  <InputGroupAddon>
                    <FaInstagram />
                  </InputGroupAddon>
                </InputGroup>
              </FormField>
             
              <FormField label="LinkedIn Link">
                <InputGroup>
                  <InputGroupInput
                    value={linkedinLink ?? ""}
                    onChange={(e) => setLinkedinLink(e.target.value)}
                    placeholder="https://www.linkedin.com/yourpage"
                  />
                  <InputGroupAddon>
                    <FaLinkedin />
                  </InputGroupAddon>
                </InputGroup>
              </FormField>
             
              <FormField label="TikTok Link">
                <InputGroup>
                  <InputGroupInput
                    value={tiktokLink ?? ""}
                    onChange={(e) => setTiktokLink(e.target.value)}
                    placeholder="https://www.tiktok.com/yourpage"
                  />
                  <InputGroupAddon>
                    <FaTiktok />
                  </InputGroupAddon>
                </InputGroup>
              </FormField>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="default" className="w-fit">Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ManageLinks;
