import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "https://hopeful-desire-21262e95c7.strapiapp.com/api";

const Index = () => {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingArticleId, setEditingArticleId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token });
      fetchArticles(token);
    }
  }, []);

  const register = async (email, username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setUser({ token: data.jwt });
        fetchArticles(data.jwt);
      } else {
        toast({
          title: "Registration failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const login = async (identifier, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setUser({ token: data.jwt });
        fetchArticles(data.jwt);
      } else {
        toast({
          title: "Login failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setArticles([]);
  };

  const fetchArticles = async (token) => {
    try {
      const response = await fetch(`${API_URL}/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setArticles(data.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const createArticle = async () => {
    try {
      const response = await fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ data: { title, description } }),
      });
      const data = await response.json();
      setArticles([...articles, data.data]);
      setTitle("");
      setDescription("");
      toast({
        title: "Article created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating article:", error);
    }
  };

  const updateArticle = async () => {
    try {
      const response = await fetch(`${API_URL}/articles/${editingArticleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ data: { title, description } }),
      });
      const data = await response.json();
      setArticles(articles.map((article) => (article.id === editingArticleId ? data.data : article)));
      setEditingArticleId(null);
      setTitle("");
      setDescription("");
      toast({
        title: "Article updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating article:", error);
    }
  };

  const deleteArticle = async (articleId) => {
    try {
      await fetch(`${API_URL}/articles/${articleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setArticles(articles.filter((article) => article.id !== articleId));
      toast({
        title: "Article deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" padding="20px">
      <Heading as="h1" size="xl" textAlign="center" marginBottom="20px">
        Article Management
      </Heading>
      {!user ? (
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Enter your email" onChange={(e) => setUser({ ...user, email: e.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" placeholder="Enter your username" onChange={(e) => setUser({ ...user, username: e.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" placeholder="Enter your password" onChange={(e) => setUser({ ...user, password: e.target.value })} />
          </FormControl>
          <Button colorScheme="blue" onClick={() => register(user.email, user.username, user.password)}>
            Register
          </Button>
          <Button variant="link" onClick={() => login(user.email, user.password)}>
            Already have an account? Login
          </Button>
        </Stack>
      ) : (
        <>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input type="text" placeholder="Enter article title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input type="text" placeholder="Enter article description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>
            <Button colorScheme="blue" onClick={editingArticleId ? updateArticle : createArticle}>
              {editingArticleId ? "Update Article" : "Create Article"}
            </Button>
          </Stack>
          <Stack spacing={4} marginTop="20px">
            {articles.map((article) => (
              <Box key={article.id} borderWidth="1px" borderRadius="lg" padding="10px">
                <Heading as="h3" size="md">
                  {article.attributes.title}
                </Heading>
                <Text>{article.attributes.description}</Text>
                <Stack direction="row" spacing={2} marginTop="10px">
                  <Button
                    leftIcon={<FaEdit />}
                    size="sm"
                    onClick={() => {
                      setEditingArticleId(article.id);
                      setTitle(article.attributes.title);
                      setDescription(article.attributes.description);
                    }}
                  >
                    Edit
                  </Button>
                  <Button leftIcon={<FaTrash />} size="sm" colorScheme="red" onClick={() => deleteArticle(article.id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
          <Button marginTop="20px" onClick={logout}>
            Logout
          </Button>
        </>
      )}
    </Box>
  );
};

export default Index;
