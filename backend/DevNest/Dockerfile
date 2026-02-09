# build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy everything (simple + reliable)
COPY . .

# If your API project folder differs, change path below
RUN dotnet restore ./DevNest/DevNest.csproj
RUN dotnet publish ./DevNest/DevNest.csproj -c Release -o /app/publish

# runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "DevNest.dll"]
