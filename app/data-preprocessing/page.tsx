"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Upload, FileText, CheckCircle2 } from "lucide-react"

export default function DataPreprocessingPage() {
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Preprocessing</h1>
        <p className="text-muted-foreground mt-2">
          Prepare and clean raw ticket data before processing through the multi-agent pipeline
        </p>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Preprocessing Pipeline
          </CardTitle>
          <CardDescription>
            Upload and process raw ticket data files for ingestion into the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Ticket Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop CSV or JSON files here, or click to browse
            </p>
            <Button disabled={isProcessing}>
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>

          {/* Processing Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preprocessing Steps</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Data Validation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Validate ticket schema and required fields
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">Data Cleaning</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remove duplicates and normalize text fields
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    <h4 className="font-medium">Vectorization</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate embeddings and update FAISS index
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              About Data Preprocessing
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This module prepares raw historical ticket data for ingestion into the FAISS vector store.
              It validates data schemas, cleans text fields, removes duplicates, and generates embeddings
              for similarity search. Processed data feeds into the Pattern Recognition pipeline.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Validated</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Processed</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
