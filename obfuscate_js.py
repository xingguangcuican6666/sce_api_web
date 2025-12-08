#!/usr/bin/env python3
import os
import re
import sys
import random
import string

def generate_random_name(length=8):
    return ''.join(random.choices(string.ascii_letters, k=length))

def obfuscate_variables(content):
    # 替换变量名
    var_pattern = r'\b(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)'
    variables = re.findall(var_pattern, content)
    var_mapping = {}
    
    for var_type, var_name in variables:
        if var_name not in var_mapping:
            var_mapping[var_name] = generate_random_name()
    
    for original, obfuscated in var_mapping.items():
        content = re.sub(r'\b' + re.escape(original) + r'\b', obfuscated, content)
    
    return content

def obfuscate_functions(content):
    # 替换函数名
    func_pattern = r'\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)'
    functions = re.findall(func_pattern, content)
    func_mapping = {}
    
    for func_name in functions:
        if func_name not in func_mapping:
            func_mapping[func_name] = generate_random_name()
    
    for original, obfuscated in func_mapping.items():
        content = re.sub(r'\b' + re.escape(original) + r'\b', obfuscated, content)
    
    return content

def obfuscate_strings(content):
    # 简单的字符串混淆
    string_pattern = r'(["\'])([^"'\\]*(\\.[^"'\\]*)*)\1'
    
    def replace_string(match):
        quote = match.group(1)
        string_content = match.group(2)
        if len(string_content) > 3:  # 只混淆较长的字符串
            return quote + ''.join([chr(ord(c) ^ 1) for c in string_content]) + quote
        return match.group(0)
    
    return re.sub(string_pattern, replace_string, content)

def remove_comments(content):
    # 移除单行注释
    content = re.sub(r'//.*', '', content)
    # 移除多行注释
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    return content

def minify(content):
    # 简单的压缩：移除多余的空白字符
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r';\s*', ';', content)
    content = re.sub(r'{\s*', '{', content)
    content = re.sub(r'}\s*', '}', content)
    content = re.sub(r'\(\s*', '(', content)
    content = re.sub(r'\s*\)', ')', content)
    return content.strip()

def obfuscate_js_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 应用混淆技术
        content = remove_comments(content)
        content = obfuscate_variables(content)
        content = obfuscate_functions(content)
        content = obfuscate_strings(content)
        content = minify(content)
        
        # 写回原文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"已混淆: {file_path}")
        return True
    except Exception as e:
        print(f"混淆 {file_path} 时出错: {e}")
        return False

def process_directory(directory):
    js_files_processed = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                file_path = os.path.join(root, file)
                if obfuscate_js_file(file_path):
                    js_files_processed += 1
    
    return js_files_processed

if __name__ == "__main__":
    current_dir = os.getcwd()
    print(f"开始混淆当前目录及其所有子目录下的JS文件...")
    
    processed_count = process_directory(current_dir)
    print(f"完成！共混淆了 {processed_count} 个JS文件。")