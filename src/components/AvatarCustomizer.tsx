// AvatarCustomizer.tsx
"use client";
import { useState, useEffect } from "react";
import { AVATAR_OPTION_FIELDS, AvatarOptions } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AvatarCustomizerProps = {
  initial?: Partial<AvatarOptions>;
  onChange: (opts: AvatarOptions) => void;
  className?: string;
  onSubmit?: () => void;
};

export default function AvatarCustomizer({
  initial = {},
  onChange,
  className,
  onSubmit,
}: AvatarCustomizerProps) {
  // Create a state object with all options, falling back to first possible value if not given
  const defaultOpts: AvatarOptions = AVATAR_OPTION_FIELDS.reduce(
    (acc, { key, field }) => {
      return {
        ...acc,
        [key]: initial[key] ?? field.values[0],
      };
    },
    {} as AvatarOptions
  );

  const [opts, setOpts] = useState<AvatarOptions>(defaultOpts);

  useEffect(() => {
    onChange(opts);
  }, [opts]);

  function handleChange<K extends keyof AvatarOptions>(
    key: K,
    value: AvatarOptions[K]
  ) {
    setOpts((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    // Rebuild options when initial prop changes
    if (initial) {
      const newOpts = AVATAR_OPTION_FIELDS.reduce((acc, { key, field }) => {
        return { ...acc, [key]: initial[key] ?? field.values[0] };
      }, {} as AvatarOptions);
      setOpts(newOpts);
    }
  }, [initial]);

  return (
    <div className={className}>
      <Card className="">
        <CardContent className="space-y-4">
          <CardTitle className="text-xl text-center">
            Customize Avatar
          </CardTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            {AVATAR_OPTION_FIELDS.map(({ key, field }) => (
              <div key={key} className="flex flex-col space-y-2 gap-1">
                <Label>{field.label}</Label>
                <Select
                  value={opts[key] as string}
                  onValueChange={(v) =>
                    handleChange(key, v as AvatarOptions[typeof key])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.values.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setOpts(defaultOpts)}>
              Reset
            </Button>

            <Button onClick={onSubmit}>Apply</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
