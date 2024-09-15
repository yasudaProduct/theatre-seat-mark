# nextjs-sample
学習用

# 環境構築
docker compose build

docker compose up -d
※npm installする必要があるので直したい

.envファイル作成

##
npx prisma generate

## migration
npx prisma migrate dev --create-only --name init
npx prisma migrate dev

## seed追加
npx prisma db seed