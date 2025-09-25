"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dataController from "@/lib/DataController";
import { API_URL } from "@/constants";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [bugTitle, setBugTitle] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [bugSubmitting, setBugSubmitting] = useState(false);
  const [featureSubmitting, setFeatureSubmitting] = useState(false);

  const dc = new dataController();

  const validateInput = (title: string, description: string, type: string) => {
    if (!title.trim()) {
      toast.error(`${type} title is required.`);
      return false;
    }
    if (title.length > 200) {
      toast.error(`${type} title is too long (max 200 characters).`);
      return false;
    }
    if (!description.trim()) {
      toast.error(`${type} description is required.`);
      return false;
    }
    if (description.length > 2000) {
      toast.error(`${type} description is too long (max 2000 characters).`);
      return false;
    }
    return true;
  };

  const handleBugSubmit = async () => {
    if (!validateInput(bugTitle, bugDescription, "Bug report")) return;

    setBugSubmitting(true);
    try {
      const response = await dc.PostData(
        API_URL + "/bugReport",
        { title: bugTitle, description: bugDescription },
        localStorage?.getItem?.("jwt") || null
      );

      if (response.success && response.data.success) {
        toast.success("Bug report submitted successfully!");
        setBugTitle("");
        setBugDescription("");
      } else {
        toast.error(
          "Failed to submit bug report: " +
            (response.data?.data || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("Failed to submit bug report: Network error");
    } finally {
      setBugSubmitting(false);
    }
  };

  const handleFeatureSubmit = async () => {
    if (!validateInput(featureTitle, featureDescription, "Feature suggestion"))
      return;

    setFeatureSubmitting(true);
    try {
      const response = await dc.PostData(
        API_URL + "/suggestFeature",
        { title: featureTitle, description: featureDescription },
        localStorage?.getItem?.("jwt") || null
      );

      if (response.success && response.data.success) {
        toast.success("Feature suggestion submitted successfully!");
        setFeatureTitle("");
        setFeatureDescription("");
      } else {
        toast.error(
          "Failed to submit suggestion: " +
            (response.data?.data || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("Failed to submit suggestion: Network error");
    } finally {
      setFeatureSubmitting(false);
    }
  };

  return (
    <div className="p-4 flex flex-row justify-center items-start min-h-screen flex-wrap gap-8">
      {/* Bug Report Card */}
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-4 pt-6">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <span className="text-2xl">🐛</span>
            Report a Bug
          </CardTitle>
          <p className="text-sm text-gray-600">
            Found a bug? Help us improve by reporting it. Please provide as much
            detail as possible.
          </p>

          <div className="space-y-2">
            <label
              htmlFor="bug-title"
              className="text-sm font-medium text-gray-700"
            >
              Bug Title *
            </label>
            <input
              id="bug-title"
              type="text"
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Brief description of the bug..."
              maxLength={200}
            />
            <div className="text-xs text-gray-500 text-right">
              {bugTitle.length}/200
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bug-description"
              className="text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="bug-description"
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              placeholder="Please describe the bug in detail - what happened, when it occurred, steps to reproduce..."
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 text-right">
              {bugDescription.length}/2000
            </div>
          </div>

          <Button
            onClick={handleBugSubmit}
            disabled={bugSubmitting}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {bugSubmitting ? "Submitting..." : "Submit Bug Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Feature Suggestion Card */}
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-4 pt-6">
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <span className="text-2xl">💡</span>
            Suggest a Feature
          </CardTitle>
          <p className="text-sm text-gray-600">
            Have an idea for improvement? We'd love to hear your suggestions!
          </p>

          <div className="space-y-2">
            <label
              htmlFor="feature-title"
              className="text-sm font-medium text-gray-700"
            >
              Feature Title
            </label>
            <input
              id="feature-title"
              type="text"
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Name of your suggested feature..."
              maxLength={200}
            />
            <div className="text-xs text-gray-500 text-right">
              {featureTitle.length}/200
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="feature-description"
              className="text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="feature-description"
              value={featureDescription}
              onChange={(e) => setFeatureDescription(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe your feature idea - what should it do, how would it help, any specific requirements..."
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 text-right">
              {featureDescription.length}/2000
            </div>
          </div>

          <Button
            onClick={handleFeatureSubmit}
            disabled={featureSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {featureSubmitting ? "Submitting..." : "Submit Suggestion"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
