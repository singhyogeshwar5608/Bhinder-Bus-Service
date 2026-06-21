"use client";

import React, { useState } from "react";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X,
  Sparkles,
  FileText,
  Smartphone,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function TermsPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    {
      title: "Acceptance of Terms",
      content: `By accessing or using the Bhinder Bus Service website and mobile application, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you should not use our services.

We reserve the right to update or modify these terms at any time without prior notice. Your continued use of our services after any changes constitutes acceptance of the new terms.`
    },
    {
      title: "Booking and Payment",
      content: `• All bookings are subject to availability and confirmation by the bus operator.
• Ticket prices are determined at the time of booking and may vary based on demand, route, and seat availability.
• Payment must be made in full at the time of booking through our secure payment gateway.
• We accept payments via UPI, Credit/Debit Cards, Net Banking, and Wallets.
• A booking is confirmed only after successful payment and receipt of a confirmation message/email.
• It is your responsibility to verify all booking details including date, time, and destination before confirming.`
    },
    {
      title: "Cancellation and Refund Policy",
      content: `• Cancellation charges apply as per the bus operator's policy and may vary by route and operator.
• Refunds, if applicable, will be processed to the original payment method within 5-7 business days.
• Partial cancellations are allowed subject to operator policy.
• No-show passengers are not eligible for any refund.
• In case of bus cancellation by the operator, a full refund will be provided.
• Cancellation requests must be made through our website or by contacting customer support.`
    },
    {
      title: "User Responsibilities",
      content: `• You must provide accurate and complete information when making a booking.
• You are responsible for maintaining the confidentiality of your account credentials.
• You must not use our platform for any unlawful or fraudulent purpose.
• You agree not to interfere with the proper functioning of our website or services.
• You must comply with all applicable laws and regulations while using our services.
• You are responsible for arriving at the boarding point at the specified time.`
    },
    {
      title: "Limitation of Liability",
      content: `Bhinder Bus Service acts as a facilitator between passengers and bus operators. We are not responsible for:

• Delays, cancellations, or changes made by the bus operator
• Loss or damage of personal belongings during travel
• Any incident or accident during the journey
• Discrepancies in bus amenities or services provided by the operator

Our total liability is limited to the ticket amount paid for the specific booking in question. We shall not be liable for any indirect, incidental, or consequential damages.`
    },
    {
      title: "Intellectual Property",
      content: `All content on our website and mobile application, including text, graphics, logos, images, and software, is the property of Bhinder Bus Service or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our explicit written consent.`
    },
    {
      title: "Contact Information",
      content: `For any questions, concerns, or complaints regarding these terms, please contact us:

Email: Bhinderbusservice@gmail.com
Phone: +91 8092000025
Address: 132/15, Ind.Area, Near SBI Bank, Patiala Road, Cheeka`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* ═══ NAVBAR ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.png" alt="Logo" className="h-18 object-contain" />
            </div>
            <nav className="hidden lg:flex items-center gap-1">
              {["Home", "Buses", "Routes", "Track Booking"].map((link, i) => (
                <button
                  key={link}
                  onClick={() => {
                    if (i === 0) navigate("/");
                    if (i === 1) navigate("/buses");
                    if (i === 2) navigate("/routes");
                    if (i === 3) navigate("/track");
                  }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                >
                  {link}
                </button>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-3">
              <Button
                className="relative h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden"
                onClick={() => {
                  localStorage.setItem("scroll_to_schedules", "true");
                  navigate("/");
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Book Now
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
              </Button>
            </div>
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {["Home", "Buses", "Routes", "Track Booking"].map((link, i) => (
                <a
                  key={link}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (i === 0) navigate("/");
                    if (i === 1) navigate("/buses");
                    if (i === 2) navigate("/routes");
                    if (i === 3) navigate("/track");
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "block px-3 py-2.5 text-sm font-medium rounded-lg",
                    "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                >
                  {link}
                </a>
              ))}
              <div className="pt-3">
                <Button
                  className="relative h-11 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  onClick={() => {
                    localStorage.setItem("scroll_to_schedules", "true");
                    navigate("/");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══ HERO HEADER ═══ */}
      <section className="pt-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-blue-100 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Terms & Conditions</h1>
          </div>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl font-medium">
            Please read these terms carefully before using our bus booking services.
          </p>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10">
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              <strong>Last Updated:</strong> June 2026
            </p>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Welcome to Bhinder Bus Service. These Terms & Conditions govern your use of our website and services. By using our platform to search, compare, and book bus tickets, you agree to these terms. Please read them carefully.
            </p>
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block" />
                    {section.title}
                  </h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-slate-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
              </div>
              <p className="text-sm text-gray-400 mb-4 font-light">
                Connecting India's cities with comfortable, safe, and modern travels. Your safety is our absolute priority.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Facebook, url: "https://www.facebook.com/share/1BwxTLz5LS/?mibextid=wwXIfr", color: "bg-[#1877F2] hover:shadow-blue-500/30" },
                  { icon: Twitter, url: "https://x.com/bhinder_bus?s=11", color: "bg-black hover:shadow-gray-500/30" },
                  { icon: Instagram, url: "https://www.instagram.com/bhinder.bus.service?igsh=Nzhhb3NxMHE5cm10&utm_source=qr", color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:shadow-pink-500/30" },
                  { icon: Youtube, url: "https://youtube.com/@bhinder_bus_service?si=kd831ChekfW3c2qc", color: "bg-[#FF0000] hover:shadow-red-500/30" },
                ].map(({ icon: Icon, url, color }, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full ${color} flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Company</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {["About Us", "Careers", "Press", "Blog"].map((link) => (
                  <li key={link}>
                    <button onClick={() => navigate("/")} className="hover:text-white transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Help & Support</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {["FAQs", "Contact Us", "Terms & Conditions", "Privacy Policy", "Refund Policy"].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => {
                        if (link === "Terms & Conditions") navigate("/terms");
                        else if (link === "Privacy Policy") navigate("/privacy");
                        else navigate("/");
                      }}
                      className="hover:text-white transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Install App</h3>
              <p className="text-sm text-gray-400 mb-4 font-light">Get special discounts and live updates on our mobile application.</p>
              <div className="space-y-2.5">
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs gap-2 py-5 justify-start px-4">
                  <Smartphone className="w-4 h-4" />
                  <span>Download for Android</span>
                </Button>
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs gap-2 py-5 justify-start px-4">
                  <Smartphone className="w-4 h-4" />
                  <span>Download for iOS</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-12 pt-6 border-t border-slate-800">
            <div className="w-full h-[200px] sm:h-[250px] rounded-xl overflow-hidden border border-slate-700">
              <iframe
                src="https://maps.google.com/maps?q=132/15+Ind.Area+Near+SBI+Bank+Patiala+Road+Cheeka&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bhinder Bus Service Location"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="mt-10 pt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                Bhinderbusservice@gmail.com
              </span>
              <span className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-1 shrink-0 text-blue-400" />
                <div className="grid grid-cols-2 gap-x-5 gap-y-0.5">
                  <a href="tel:+918092000025" className="text-sm text-gray-400 hover:text-white transition-colors">+91 8092000025</a>
                  <a href="tel:+919991600025" className="text-sm text-gray-400 hover:text-white transition-colors">+91 9991600025</a>
                  <a href="tel:+919996021425" className="text-sm text-gray-400 hover:text-white transition-colors">+91 9996021425</a>
                  <a href="tel:+918481000025" className="text-sm text-gray-400 hover:text-white transition-colors">+91 8481000025</a>
                </div>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Payment Certified</span>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© 2026 BusBook. All rights reserved. Made for premium journeys.</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>132/15, Ind.Area, Near SBI Bank, Patiala Road, Cheeka</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
