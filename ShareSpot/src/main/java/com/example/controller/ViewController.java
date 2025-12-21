package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/login")
    public String login() {
        return "login.html";
    }

    @GetMapping("/main")
    public String main() {
        return "main.html";
    }
}
//헤헤 tlqkf