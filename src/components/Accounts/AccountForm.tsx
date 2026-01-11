import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CookieUpload from './CookieUpload';
import PrioritySlider from './PrioritySlider';
import type { Account } from '@/types/agent';
import { Save, X, Loader2 } from 'lucide-react';

const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  notebookUrl: z
    .string()
    .trim()
    .url('Invalid URL')
    .refine(
      (url) => url.includes('colab.research.google.com') || url.includes('colab.google'),
      'Must be a Google Colab URL'
    ),
  priority: z.number().min(1).max(100),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: Account | null;
  onSubmit: (data: AccountFormData & { cookieFile?: File | null }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  totalAccounts?: number;
}

const AccountForm = ({
  account,
  onSubmit,
  onCancel,
  isLoading,
  totalAccounts = 1,
}: AccountFormProps) => {
  const isEditing = !!account;
  const [cookieFile, setCookieFile] = useState<File | null>(null);
  const [cookieError, setCookieError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name || '',
      email: account?.email || '',
      notebookUrl: account?.notebookUrl || '',
      priority: account?.priority || totalAccounts + 1,
    },
  });

  const priority = watch('priority');

  const onFormSubmit = async (data: AccountFormData) => {
    // Validate cookie file for new accounts
    if (!isEditing && !cookieFile) {
      setCookieError('Cookie file is required for new accounts');
      return;
    }
    setCookieError(undefined);
    await onSubmit({ ...data, cookieFile });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-mono text-primary">
          {isEditing ? 'Edit Account' : 'Add New Account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-primary">
              Account Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Training Account"
              className="bg-secondary border-border"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-primary">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="account@example.com"
              className="bg-secondary border-border"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Notebook URL */}
          <div className="space-y-2">
            <Label htmlFor="notebookUrl" className="text-primary">
              Colab Notebook URL
            </Label>
            <Input
              id="notebookUrl"
              {...register('notebookUrl')}
              placeholder="https://colab.research.google.com/drive/..."
              className="bg-secondary border-border"
              disabled={isLoading}
            />
            {errors.notebookUrl && (
              <p className="text-sm text-destructive">{errors.notebookUrl.message}</p>
            )}
          </div>

          {/* Cookie File Upload */}
          <div className="space-y-2">
            <Label className="text-primary">
              Cookie File {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <CookieUpload
              value={cookieFile}
              onChange={setCookieFile}
              error={cookieError}
              disabled={isLoading}
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Leave empty to keep existing cookie file
              </p>
            )}
          </div>

          {/* Priority Slider */}
          <PrioritySlider
            value={priority}
            onChange={(v) => setValue('priority', v)}
            max={Math.max(10, totalAccounts + 1)}
            disabled={isLoading}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountForm;
