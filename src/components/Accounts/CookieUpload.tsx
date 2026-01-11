import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface CookieUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

const CookieUpload = ({ value, onChange, error, disabled }: CookieUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              return 100;
            }
            return prev + 20;
          });
        }, 200);

        onChange(file);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10',
          error && 'border-destructive/50',
          disabled && 'opacity-50 cursor-not-allowed',
          value && 'border-neon/50 bg-neon/5'
        )}
      >
        <input {...getInputProps()} />

        {value ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon/20 flex items-center justify-center">
              {isUploading ? (
                <Upload className="w-5 h-5 text-neon animate-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5 text-neon" />
              )}
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {value.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(value.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-secondary mx-auto flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Drop the file here' : 'Upload Cookie File'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag and drop or click to select (.json, .txt)
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default CookieUpload;
