# 1 目录（打包上传目录；项目目录）
upload_path="./upload"
target_path="./xinfangBroker"

echo "upload_path打包路径: $upload_path"
echo "target_path项目路径: $target_path"

# 2 配置信息 Release版本
configuration="Release"
#Release  AgYMrbD87Wic8fIZuJK3gKL9wNHP4ksvOXqog
#Staging 5zEdOgnf4OcrgIiprpkclR3tAed44ksvOXqog
# 项目名称

target_name="xinfangBroker"
project_name="${target_name}.xcodeproj"
workspace_name="${target_name}.xcworkspace"

project_name="${target_name}.xcodeproj"
scheme="$target_name"

echo "configuration配置: $configuration"
echo "target_name项目名称: $target_name"

echo "scheme名称: $scheme"

# archive包时使用证书、描述文件UUID；ipa包时使用描述文件（描述文件名称）
codeSignIdentity="iPhone Distribution: Shenzhen Kaixinfang Network Technology Co., Ltd."
provision_UUID="e2c9d1df-cea1-4673-930d-5c17d7ad7d13"
provisoning_profile=""

echo "codeSignIdentity开发证书: $codeSignIdentity"
echo "provision_UUID描述文件UUID: $provision_UUID"
echo "provisoning_profile描述文件: $provisoning_profile"

rm -rf "$upload_path"
mkdir "$upload_path"

ipa_path="$upload_path/"
archive_path="$upload_path/${target_name}.xcarchive"
log_path="$upload_path/log.txt"

echo "ipa_path导出路径: $ipa_path"
echo "archive_path生成路径: $archive_path"
echo "log_path打印路径: $log_path"

#cd "$target_path"
#pwd
# 4 清理构建目录
# xcodebuild clean -configuration "$configuration" -alltargets
xcodebuild clean -configuration "$configuration" -alltargets >> $log_path

# 5 归档（其他参数不指定的话，默认用的是.xcworkspace或.xcodeproj文件里的配置）
 xcodebuild archive -project "$project_name" -scheme "$scheme" -configuration "$configuration" -archivePath "$archive_path" # CODE_SIGN_IDENTITY="$codeSignIdentity" >> $log_path
#xcodebuild  -project "$project_name" -scheme "$scheme" -configuration "$configuration"

if [ -d $archive_path ];then
  # 6 导出IPA
  xcodebuild -exportArchive -archivePath "$archive_path" -exportPath "$ipa_path" -exportOptionsPlist exportOptions.plist # -exportProvisioningProfile "$provisoning_profile" >> $log_path
  #xcrun -sdk iphoneos -v build/Release-iphoneos/"$target_name".app  -o build/Release-iphoneos/"$target_name".ipa

  cd "$ipa_path"
  mv xinfangBroker.ipa AnChang.ipa
fi
