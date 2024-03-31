FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /usr/app
COPY . .
RUN npm install
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}
COPY package.json ./
COPY --from=builder /usr/app/dist/index.js ./
COPY --from=builder /usr/app/dist/functions ./functions
COPY --from=builder /usr/app/dist/interfaces ./interfaces
COPY --from=builder /usr/app/dist/models ./models
COPY --from=builder /usr/app/dist/logger ./logger
RUN npm i
CMD ["index.handler"]