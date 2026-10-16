import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { Image } from "expo-image";
import { useRef, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("請輸入有效的 Email"),
  password: z.string().min(1, "請輸入密碼"),
});

type LoginForm = z.infer<typeof loginSchema>;

// TextInput 的 placeholder 顏色沒有 className 對應，只能用 prop；同 @theme 的 --color-ink-faint
const PLACEHOLDER_COLOR = "#9aa1b2";

function toErrorMessage(error: Error) {
  if ("code" in error && error.code === "invalid_credentials")
    return "Email 或密碼錯誤";
  if (isAuthRetryableFetchError(error)) return "無法連線，請稍後再試";
  return error.message;
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // 成功不手動導頁：SIGNED_IN → session 寫入 store → Stack.Protected 自動切到 (tabs)
  const onSubmit = handleSubmit(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError("root", { message: toErrorMessage(error) });
  });

  return (
    <View className="flex-1 bg-surface">
      <BackgroundGlow />

      {/* react-native-css 不會替 SafeAreaView 處理 className，安全區改用 insets 自己補 */}
      {/* RN 的鍵盤會直接蓋住內容，需手動避讓。Android 強制 edge-to-edge 後 adjustResize 不再縮視窗，兩平台都要 padding */}
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1 justify-center px-5"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <LogoMark />
        <Text className="mt-8 text-[34px] font-extrabold tracking-tight text-ink">
          Keepr
        </Text>
        <Text className="mt-1 text-[15px] text-ink-soft">
          別讓任何一位客戶被遺忘。
        </Text>

        <View className="mt-12 gap-3">
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldCard label="Email">
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="you@example.com"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="username"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  className="p-0 text-[17px] font-semibold text-ink"
                />
              </FieldCard>
            )}
          />
          {errors.email && <FieldError message={errors.email.message} />}

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldCard label="密碼">
                <TextInput
                  ref={passwordRef}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••••"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                  className="p-0 text-[17px] font-semibold text-ink"
                />
              </FieldCard>
            )}
          />
          {errors.password && <FieldError message={errors.password.message} />}

          {errors.root && <FieldError message={errors.root.message} />}

          <Pressable
            onPress={onSubmit}
            disabled={isSubmitting}
            className={
              isSubmitting
                ? "h-[58px] items-center justify-center rounded-[20px] bg-accent opacity-60"
                : "h-[58px] items-center justify-center rounded-[20px] bg-accent"
            }
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-[17px] font-bold text-white">登入</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// 白底圓角卡片，label 在框內上方
function FieldCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1 rounded-[18px] border border-line bg-white px-[18px] py-3.5">
      <Text className="text-[13px] text-ink-faint">{label}</Text>
      {children}
    </View>
  );
}

function FieldError({ message }: { message?: string }) {
  return <Text className="px-2 text-[13px] text-danger">{message}</Text>;
}

// 品牌標誌：沿用 app icon 圖檔。expo-image 沒被 react-native-css 包裝，尺寸與圓角用 style；
// 陰影放外層 View，因為 iOS 上圓角裁切（overflow hidden）會把同一層的陰影一起裁掉
function LogoMark() {
  return (
    <View className="h-[68px] w-[68px] rounded-[20px] shadow-lg">
      <Image
        source={require("../../../assets/images/icon.png")}
        style={{ width: 68, height: 68, borderRadius: 20 }}
        contentFit="cover"
        accessibilityLabel="Keepr"
      />
    </View>
  );
}

// 設計稿背景：右上綠、左下橘的柔和光暈（純裝飾，不攔截觸控）
function BackgroundGlow() {
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <View
        className="absolute -right-[60px] -top-[80px] h-[380px] w-[380px]"
        style={{
          experimental_backgroundImage:
            "radial-gradient(circle, rgba(140, 200, 165, 0.55) 0%, rgba(140, 200, 165, 0) 70%)",
        }}
      />
      <View
        className="absolute -bottom-[20px] -left-[140px] h-[380px] w-[380px]"
        style={{
          experimental_backgroundImage:
            "radial-gradient(circle, rgba(235, 190, 140, 0.45) 0%, rgba(235, 190, 140, 0) 70%)",
        }}
      />
    </View>
  );
}
