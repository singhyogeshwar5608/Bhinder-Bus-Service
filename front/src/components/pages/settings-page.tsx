"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Globe,
  Lock,
  Smartphone,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <h3 className="text-base font-semibold text-gray-900">
              Profile Information
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Your personal information and account details
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-gray-600 border-gray-200"
              >
                Change Photo
              </Button>
            </div>

            {/* Profile Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-800">
                    Rajesh Kumar
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-800">
                    admin@busbookcrm.in
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Role
                </Label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-800">Super Admin</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-800">
                    +91 98765 43210
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <h3 className="text-base font-semibold text-gray-900">
              Notification Settings
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage how you receive notifications
          </p>
        </div>
        <div className="p-6 space-y-5">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Receive booking and payment alerts via email
                </p>
              </div>
            </div>
            <Switch
              checked={emailNotif}
              onCheckedChange={setEmailNotif}
            />
          </div>

          <Separator />

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  SMS Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Get critical alerts via SMS on your phone
                </p>
              </div>
            </div>
            <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
          </div>

          <Separator />

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Push Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Browser push notifications for real-time updates
                </p>
              </div>
            </div>
            <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <h3 className="text-base font-semibold text-gray-900">
              System Settings
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Regional and localization preferences
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Currency
              </Label>
              <Select defaultValue="inr">
                <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-200">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inr">₹ INR - Indian Rupee</SelectItem>
                  <SelectItem value="usd">$ USD - US Dollar</SelectItem>
                  <SelectItem value="eur">€ EUR - Euro</SelectItem>
                  <SelectItem value="gbp">£ GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Timezone
              </Label>
              <Select defaultValue="ist">
                <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-200">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ist">
                    IST (UTC+5:30) - India
                  </SelectItem>
                  <SelectItem value="utc">UTC (UTC+0:00)</SelectItem>
                  <SelectItem value="est">
                    EST (UTC-5:00) - Eastern
                  </SelectItem>
                  <SelectItem value="pst">
                    PST (UTC-8:00) - Pacific
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Language
              </Label>
              <Select defaultValue="en">
                <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-200">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <h3 className="text-base font-semibold text-gray-900">
              Security
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your password and security preferences
          </p>
        </div>
        <div className="p-6 space-y-5">
          {/* Password Change Form */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-800">
              Change Password
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="h-10 text-sm pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="h-10 text-sm pr-10"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="h-10 px-6 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
