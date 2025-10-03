import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface SecurityTabProps {
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  onPasswordFormChange: (form: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  passwordForm,
  onPasswordFormChange,
  onSubmit
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Key" size={20} />
          Смена пароля
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="currentPassword">Текущий пароль</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => onPasswordFormChange({...passwordForm, currentPassword: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Новый пароль</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => onPasswordFormChange({...passwordForm, newPassword: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => onPasswordFormChange({...passwordForm, confirmPassword: e.target.value})}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <Icon name="Save" size={16} className="mr-2" />
            Сменить пароль
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecurityTab;
